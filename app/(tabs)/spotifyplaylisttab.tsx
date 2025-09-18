import { useWebSocket } from '@/contexts/WebsocketContext';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SpotifyPlaylistTab() {
    const { state, sendCommandWithStateUpdate } = useWebSocket();

    const {
        playlists,
    } = state;


    return (
        <View style={styles.playlistContainer}>
            <View style={styles.pageTitle}>
                <Text style={styles.title}>Playlist</Text>
            </View>


            <View style={styles.scrollViewContainer}>
                {/* ScrollView orizzontale */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.playlistAlbumContainer}
                >
                    <View style={styles.playlistItem}>
                        <Image style={styles.playlistImage} source={{ uri: 'https://misc.scdn.co/liked-songs/liked-songs-300.jpg', }} />
                        <Text style={styles.playlistName}>Brani che ti piacciono</Text>
                    </View>
                    {playlists?.map((playlist, index) => (
                        <View key={index} style={styles.playlistItem}>
                            <Image
                                style={[styles.playlistImage, { resizeMode: 'cover' }]}
                                source={{ uri: playlist.image }}
                            />
                            <Text
                                style={styles.playlistName}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {playlist.name}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    playlistContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageTitle: {
        position: "absolute",
        top: 0,
        justifyContent: "center",
        width: '100%',
        height: 70,
        zIndex: 1,
    },
    title: {
        fontSize: 35,
        left: 30,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: "bold",
    },
    playlistAlbumContainer: {
        height: 250,
        paddingHorizontal: 20,
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
        alignSelf: "center",
    },
    playlistItem: {
        top: 15,
        alignItems: "center",
        width: 200,
    },
    playlistImage: {
        maxWidth: 200,
        maxHeight: 200,
        minWidth: 200,
        minHeight: 200,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 15,
        marginBottom: 5,
    },
    playlistName: {
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollViewContainer: {
        flex: 1,
        width: '90%',
    }
});
