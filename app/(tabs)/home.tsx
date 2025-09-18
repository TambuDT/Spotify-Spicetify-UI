import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import PagerView from 'react-native-pager-view';
import SpotifyTab from './spotifytab';

export default function Home() {
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
      />
      <PagerView style={styles.pagerView} initialPage={0}>

        <View key="1" style={styles.page}>
          <SpotifyTab/>
        </View>

        <View key="2" style={styles.page}>
          <Text style={styles.text}>Tab 2</Text>
        </View>

      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222', // o qualsiasi colore ti serva
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
});
