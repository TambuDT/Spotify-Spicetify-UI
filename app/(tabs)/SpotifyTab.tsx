import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
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

import NoAudio from '../../assets/buttons/noaudio';
import Repeat1 from '../../assets/buttons/repeat1';

import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import CustomSlider from '@/components/CustomSlider';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import PagerView from 'react-native-pager-view';

import { useWebSocket } from '@/contexts/WebsocketContext';

export default function SpotifyTab() {
    const { state, sendCommandWithStateUpdate } = useWebSocket();

    const {
        isPlaying,
        trackName,
        trackArtists,
        trackDuration,
        trackProgress,
        trackPercentage,
        trackImage,
        trackHeart,
        isMuted,
        shuffle,
        repeat
    } = state;

    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width;

    const PNSize = 40; // play/prev next
    const PPSize = 50; // play/pause

    const albumSize = useRef(new Animated.Value(270)).current;

    // Animazione album art
    useEffect(() => {
        Animated.timing(albumSize, {
            toValue: isPlaying ? 300 : 270,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isPlaying]);

    const togglePlayPause = () => sendCommandWithStateUpdate(isPlaying ? "pause" : "play");
    const togglePrevNext = (direction) => sendCommandWithStateUpdate(direction === "prev" ? "previous" : "next");

    const handleAdditionalCommands = (command) => {
        switch (command) {
            case "volumeup":
            case "volumedown":
            case "heart":
                sendCommandWithStateUpdate(command);
                break;
            case "audio":
                sendCommandWithStateUpdate(isMuted ? "unmute" : "mute");
                break;
            case "shuffle":
            case "repeat":
                sendCommandWithStateUpdate(command);
                break;
            default:
                break;
        }
    };


    if (state.isLoading) {
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
            <PagerView style={styles.pagerView} initialPage={0} orientation="vertical">
                {/* Pagina controllo musica */}
                <View key="1" style={[styles.page, { flexDirection: isPortrait ? 'column' : 'row' }]}>
                    <View style={styles.leftPanel}>
                        <Animated.Image
                            source={{ uri: trackImage }}
                            style={[styles.albumArtBase, { width: albumSize, height: albumSize }]}
                            resizeMode="cover"
                        />
                    </View>

                    <View style={styles.rightPanel}>
                        {/* Comandi secondari */}
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

                            <TouchableOpacity style={styles.customButtonCircular} onPress={() => handleAdditionalCommands('repeat')}>
                                {repeat === 2 ? (
                                    <Repeat1 size={30} color="rgb(30, 215, 96)" />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faRepeat}
                                        size={30}
                                        style={[styles.buttonIcon, repeat > 0 && { color: 'rgb(30, 215, 96)' }]}
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

                        {/* Titolo canzone */}
                        <View>
                            <Text style={[styles.textStyle, styles.songName]} numberOfLines={1}>{trackName}</Text>
                            <Text style={[styles.textStyle, styles.artistName]} numberOfLines={1}>{trackArtists}</Text>
                        </View>

                        {/* Comandi principali */}
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

                        {/* Slider */}
                        <View style={styles.sliderContainer}>
                            <CustomSlider
                                value={trackPercentage}
                                onSlidingComplete={(val) => {
                                    console.log('Valore finale slider:', val);
                                }}
                                trackHeight={12}
                                trackColor="rgba(255,255,255,0.3)"
                                trackTintColor="rgba(255,255,255,0.5)"
                                thumbSize={0}
                                style={{ height: 40 }}
                            />
                        </View>

                        {/* Tempo */}
                        <View style={styles.timeContainer}>
                            <Text style={styles.textStyle}>{trackProgress}</Text>
                            <Text style={styles.textStyle}>{trackDuration}</Text>
                        </View>
                    </View>
                </View>

                {/* Tab 2 */}
                <View key="2" style={styles.page}>
                    <Text style={styles.textStyle}>Tab 2</Text>
                </View>
            </PagerView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    pagerView: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)'
    },
    leftPanel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rightPanel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 280
    },
    playerButton: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    playerButtonIcon: {
        color: 'rgba(255,255,255,0.8)'
    },
    sliderContainer: {
        flexDirection: 'row',
        width: 350,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 400,
        paddingHorizontal: 20
    },
    textStyle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)'
    },
    songName: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        marginHorizontal: 30,
        color: 'rgba(255,255,255,0.85)'
    },
    artistName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        marginHorizontal: 30,
        color: 'rgba(255,255,255,0.6)'
    },
    secondControllerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 350,
        marginBottom: 20
    },
    customButtonCircular: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 5
    },
    buttonIcon: {
        color: 'rgba(255,255,255,0.8)'
    },
});
