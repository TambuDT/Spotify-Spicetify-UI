import {
    faBackward,
    faForward,
    faHeart,
    faMinus,
    faPause,
    faPlay,
    faPlus,
    faRepeat,
    faShuffle,
    faVolumeUp
} from '@fortawesome/free-solid-svg-icons';

import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

import NoAudio from '../../assets/buttons/noaudio';
import Repeat1 from '../../assets/buttons/repeat1';

import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import CustomSlider from '@/components/CustomSlider';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

export default function SpotifyTab() {

    const { width, height } = useWindowDimensions(); //per modificare l'interfaccia a seconda della rotazione del telefono
    const isPortrait = height >= width;


    const PNSize = 40;
    const PPSize = 50;

    const websocket = useRef(null);
    const reconnectTimeout = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [trackName, setTrackName] = useState("Song Title");
    const [trackArtists, setTrackArtists] = useState("Artist Name");
    const [trackDuration, setTrackDuration] = useState("0:00");
    const [trackProgress, setTrackProgress] = useState("0:00");
    const [trackPercentage, setTrackPercentage] = useState(0);
    const [trackImage, setTrackImage] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(0);
    const [trackHeart, setTrackHeart] = useState(false);

    const albumSize = useRef(new Animated.Value(270)).current;

    // Funzione per inviare comandi solo se WS aperto
    const sendCommand = (command) => {
        if (websocket.current?.readyState === WebSocket.OPEN) {
            websocket.current.send(JSON.stringify({ type: 'COMMAND', data: { command } }));
            console.log(`Comando inviato: ${command}`);
        } else {
            console.warn('WebSocket non aperto. Comando non inviato:', command);
        }
    };

    const connectWebSocket = () => {
        if (websocket.current) {
            websocket.current.onopen = null;
            websocket.current.onmessage = null;
            websocket.current.onclose = null;
            websocket.current.onerror = null;
            websocket.current.close();
            websocket.current = null;
        }

        websocket.current = new WebSocket("ws://192.168.1.62:8766");

        websocket.current.onopen = () => {
            console.log("WebSocket connesso.");
            sendCommand("isplaying");
            setLoading(false);
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
        };

        websocket.current.onmessage = ({ data }) => {
            try {
                const message = JSON.parse(data);
                switch (message.type) {
                    case 'TRACK_INFO':
                        setTrackName(message.data?.trackName || "Unknown");
                        setTrackArtists(message.data?.trackArtists || "Unknown");
                        setTrackDuration(message.data?.trackDuration || "0:00");
                        setTrackImage(message.data?.trackImage || "");
                        setTrackHeart(!!message.data?.trackHeart);
                        break;
                    case 'PLAYER_STATE':
                        // Aggiorna lo stato solo quando arriva conferma dal server
                        setIsPlaying(message.data?.state === "true");
                        setIsMuted(!!message.data?.mute);
                        setShuffle(!!message.data?.shuffle);
                        if (message.data?.repeat !== undefined) {
                            setRepeat(message.data.repeat);
                        }
                        break;
                    case 'TRACK_PROGRESS':
                        setTrackProgress(message.data?.progress || "0:00");
                        setTrackPercentage(message.data?.percentage || 0);
                        break;
                    case 'REPEAT_STATE':
                        setRepeat(message.data?.repeatState);
                        break;
                }
            } catch (err) {
                console.error('Errore parsing JSON:', err);
            }
        };

        websocket.current.onclose = () => {
            console.log("WebSocket disconnesso. Riconnessione in corso...");
            // Backoff esponenziale semplice (max 10 sec)
            let delay = 1000;
            if (reconnectTimeout.current) {
                delay = Math.min(delay * 2, 10000);
                clearTimeout(reconnectTimeout.current);
            }
            reconnectTimeout.current = setTimeout(connectWebSocket, delay);
        };

        websocket.current.onerror = (error) => {
            console.error("Errore WebSocket:", error.message);
            // Chiudi connessione per triggerare onclose e riconnessione
            websocket.current.close();
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            websocket.current?.close();
        };
    }, []);

    useEffect(() => {
        let interval;
        if (websocket.current?.readyState === WebSocket.OPEN && isPlaying) {
            interval = setInterval(() => sendCommand("trackprogress"), 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    useEffect(() => {
        Animated.timing(albumSize, {
            toValue: isPlaying ? 300 : 270,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isPlaying]);

    const togglePlayPause = () => {
        // Aggiorna lo stato locale immediatamente per reattività UI
        if(isPlaying==true){
            setIsPlaying(false);
        }
        else{
            setIsPlaying(true);
        }
        // Invia comando al server per mettere in play pause in base allo stato attuale di isPlaying
        sendCommand(isPlaying ? "pause" : "play");
    };

    const togglePrevNext = (direction) => {
        sendCommand(direction === "prev" ? "previous" : "next");
    };

    const handleAdditionalCommands = (command) => {
        switch (command) {
            case "volumeup":
            case "volumedown":
                sendCommand(command);
                break;
            case "repeat":
                sendCommand("repeat");
                // Aggiorna localmente ma aspettati aggiornamenti server per sicurezza
                setRepeat((r) => (r + 1) % 3);
                break;
            case "shuffle":
                sendCommand("shuffle");
                setShuffle((s) => !s);
                break;
            case "audio":
                sendCommand(isMuted ? "unmute" : "mute");
                setIsMuted(!isMuted);
                break;
            case "heart":
                sendCommand("heart");
                setTrackHeart((h) => !h);
                break;
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Caricamento...</Text>
            </View>
        );
    }
    return (
        <ImageBackground
            source={{ uri: trackImage }}
            style={{ width: '100%', height: '100%' }}
            blurRadius={50}
            resizeMode="cover"
        >
            <View style={[styles.page, { flexDirection: isPortrait ? 'column' : 'row' }]}>

                {/* Pannello di sinistra */}
                <View style={styles.leftPanel}>
                    <Animated.Image
                        source={{ uri: trackImage }}
                        style={[
                            styles.albumArtBase,
                            {
                                width: albumSize,
                                height: albumSize,
                            }
                        ]}
                        resizeMode="cover"
                    />

                </View>

                {/*Pannello di destra */}
                <View style={styles.rightPanel}>

                    {/*Comandi volume ripetizione shuffle prefetiti */}

                    <View style={styles.secondControllerContainer}>
                        <TouchableOpacity style={styles.customButtonCircular} onPress={() => handleAdditionalCommands('heart')}>
                            {trackHeart ? (
                                <FontAwesomeIcon icon={faHeart} size={30} style={styles.buttonIcon} />
                            ) : (
                                <FontAwesomeIcon icon={faHeartRegular} size={30} style={styles.buttonIcon} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.customButtonCircular} onPress={() => handleAdditionalCommands('audio')}>
                            {isMuted ? (
                                <NoAudio size={28} color='rgba(255, 255, 255, 0.8)' />
                            ) : (
                                <FontAwesomeIcon icon={faVolumeUp} size={30} style={styles.buttonIcon} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.customButtonCircular} onPress={() => handleAdditionalCommands('volumedown')}>
                            <FontAwesomeIcon icon={faMinus} size={30} style={styles.buttonIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.customButtonCircular} onPress={() => handleAdditionalCommands('volumeup')}>
                            <FontAwesomeIcon icon={faPlus} size={30} style={styles.buttonIcon} />
                        </TouchableOpacity>




                        <TouchableOpacity
                            style={styles.customButtonCircular}
                            onPress={() => handleAdditionalCommands('repeat')}
                        >
                            {repeat === 2 ? (
                                <Repeat1 size={30} color="rgb(30, 215, 96)" />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faRepeat}
                                    size={30}
                                    style={[
                                        styles.buttonIcon,
                                        repeat === 1 && { color: 'rgb(30, 215, 96)' }
                                    ]}
                                />
                            )}
                        </TouchableOpacity>


                        <TouchableOpacity style={styles.customButtonCircular} onPress={() => handleAdditionalCommands('shuffle')}>
                            <FontAwesomeIcon
                                icon={faShuffle}
                                size={30}
                                style={[styles.buttonIcon, shuffle && { color: 'rgb(30, 215, 96)' }]}
                            />
                        </TouchableOpacity>

                    </View>


                    {/*Titolo canzone e artista */}
                    <View>
                        <Text style={[styles.textStyle, styles.songName]} numberOfLines={1}>{trackName}</Text>
                        <Text style={[styles.textStyle, styles.artistName]} numberOfLines={1}>{trackArtists}</Text>
                    </View>


                    {/*Comandi player */}
                    <View style={styles.mainControls}>
                        <TouchableOpacity style={styles.playerButton} onPress={() => togglePrevNext("prev")}>
                            <FontAwesomeIcon icon={faBackward} size={PNSize} style={styles.playerButtonIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playerButton} onPress={() => togglePlayPause()}>
                            <FontAwesomeIcon
                                icon={isPlaying ? faPause : faPlay}
                                size={PPSize}
                                style={styles.playerButtonIcon}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playerButton} onPress={() => togglePrevNext("next")}>
                            <FontAwesomeIcon icon={faForward} size={PNSize} style={styles.playerButtonIcon} />
                        </TouchableOpacity>
                    </View>

                    {/*slider */}
                    <View style={styles.sliderContainer}>
                        <CustomSlider
                            value={trackPercentage}          // numero da 0 a 100
                            onSlidingComplete={(val) => {
                                console.log('Valore finale slider:', val);
                                // es. invia comando seek
                            }}
                            trackHeight={12}                  // opzionale, altezza track
                            trackColor="rgba(255,255,255,0.3)"       // colore track "vuota"
                            trackTintColor="rgba(255,255,255,0.5)"   // colore track "riempita"
                            thumbSize={0}                   // dimensione thumb
                            style={{ height: 40 }}           // altezza area tappabile
                        />
                    </View>

                    {/*tempo */}
                    <View style={styles.timeContainer}>
                        <Text style={styles.textStyle}>{trackProgress}</Text>
                        <Text style={styles.textStyle}>{trackDuration}</Text>
                    </View>


                </View>
            </View>
        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        flexDirection: 'row',
    },
    leftPanel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightPanel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    albumArtBase: {
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 8,
        filter: 'brightness(0.7)',
    },
    mainControls: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: 280,
    },
    playerButton: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerButtonIcon: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    sliderContainer: {
        flexDirection: 'row',
        width: 350,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 400,
        paddingHorizontal: 20,
    },
    textStyle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
    },
    songName: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        marginLeft: 30,
        marginRight: 30,
        color: 'rgba(255, 255, 255, 0.85)',
    },
    artistName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        marginLeft: 30,
        marginRight: 30,
    },
    secondControllerContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: 350,
        marginBottom: 20,
    },
    customButtonCircular: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 5,
    },
    buttonIcon: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
});

