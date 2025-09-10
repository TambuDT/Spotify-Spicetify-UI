import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  View,
} from 'react-native';

type Props = {
  value: number; // da 0 a 100
  onSlidingComplete?: (value: number) => void;
  trackHeight?: number;
  trackColor?: string;
  trackTintColor?: string;
  thumbSize?: number;
  thumbColor?: string;
  style?: object;
};

const CustomSlider: React.FC<Props> = ({
  value,
  onSlidingComplete,
  trackHeight = 6,
  trackColor = 'rgba(255,255,255,0.3)',
  trackTintColor = 'rgba(255,255,255,0.9)',
  thumbSize = 12,
  thumbColor = 'rgba(255,255,255,0.95)',
  style,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const lastValue = useRef(value);

  // Quando cambia prop `value` aggiorna la posizione
  useEffect(() => {
    if (trackWidth > 0) {
      const pos = (value / 100) * trackWidth;
      pan.setValue(pos);
      lastValue.current = value;
    }
  }, [value, trackWidth, pan]);

  // Gestore layout track per misurare la larghezza
  const onTrackLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setTrackWidth(width);
    // Posiziona thumb in base al valore iniziale
    const pos = (value / 100) * width;
    pan.setValue(pos);
  };

  // PanResponder per drag thumb
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        pan.setOffset(pan.__getValue());
        pan.setValue(0);
      },

      onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        let newPos = gestureState.dx + pan._offset;
        if (newPos < 0) newPos = 0;
        if (newPos > trackWidth) newPos = trackWidth;
        pan.setValue(newPos);
      },

      onPanResponderRelease: () => {
        pan.flattenOffset();
        const finalValue = (pan.__getValue() / trackWidth) * 100;
        lastValue.current = finalValue;
        onSlidingComplete && onSlidingComplete(Math.round(finalValue));
      },

      onPanResponderTerminate: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <View style={[styles.container, style]}>

      <View style={[styles.trackBackground, { height: trackHeight, backgroundColor: trackColor }]} onLayout={onTrackLayout}>

        <Animated.View
          style={[
            styles.trackFill,
            {
              backgroundColor: trackTintColor,
              height: trackHeight,
              width: pan,
              borderRadius: trackHeight / 2,
              position: 'absolute',
              left: 0,
              top: 0,
            },
          ]}
        />

        {/* Thumb */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbColor,
              transform: [
                {
                  translateX: Animated.subtract(pan, thumbSize / 2),
                },
              ],
              position: 'absolute',
              top: (trackHeight - thumbSize) / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
  trackBackground: {
    width: '100%',
    borderRadius: 10,
  },
  trackFill: {
      borderRadius: 100,
  },
  thumb: {
    elevation: 3, // per android shadow
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});

export default CustomSlider;
