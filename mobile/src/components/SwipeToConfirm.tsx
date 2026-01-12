import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.7; // 70% of container width

interface SwipeToConfirmProps {
  onConfirm: () => void;
  text?: string;
  confirmText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  backgroundColor?: string;
}

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  text = 'Swipe to logout',
  confirmText = 'Release to logout',
  icon = 'log-out-outline',
  color = COLORS.danger,
  backgroundColor = '#fff5f5',
}) => {
  const [containerWidth, setContainerWidth] = useState(300);
  const pan = useRef(new Animated.Value(0)).current;
  const [isConfirming, setIsConfirming] = useState(false);

  const maxSwipeDistance = containerWidth - 60; // Container width minus thumb width

  useEffect(() => {
    // Reset position if any state changes
    const listener = pan.addListener(({ value }) => {
      if (value === 0) {
        setIsConfirming(false);
      }
    });

    return () => {
      pan.removeListener(listener);
    };
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left to right movement
        const newValue = Math.max(0, Math.min(gestureState.dx, maxSwipeDistance));
        pan.setValue(newValue);
        
        // Update confirming state based on threshold
        if (newValue >= maxSwipeDistance * SWIPE_THRESHOLD && !isConfirming) {
          setIsConfirming(true);
        } else if (newValue < maxSwipeDistance * SWIPE_THRESHOLD && isConfirming) {
          setIsConfirming(false);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeDistance = gestureState.dx;
        
        // Check if swipe reached threshold
        if (swipeDistance >= maxSwipeDistance * SWIPE_THRESHOLD) {
          // Confirmed - trigger action
          Animated.timing(pan, {
            toValue: maxSwipeDistance,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onConfirm();
            // Reset after confirm
            setTimeout(() => {
              Animated.timing(pan, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }, 500);
          });
        } else {
          // Not confirmed - animate back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const thumbTranslate = pan.interpolate({
    inputRange: [0, maxSwipeDistance],
    outputRange: [0, maxSwipeDistance],
    extrapolate: 'clamp',
  });

  const trackOpacity = pan.interpolate({
    inputRange: [0, maxSwipeDistance * SWIPE_THRESHOLD],
    outputRange: [0.3, 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: thumbTranslate,
            opacity: trackOpacity,
            backgroundColor: color + '20', // 20% opacity
          },
        ]}
      />
      
      <Text style={[styles.text, { color }]}>
        {isConfirming ? confirmText : text}
      </Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            transform: [{ translateX: thumbTranslate }],
            backgroundColor: color,
          },
        ]}
      >
        <Ionicons name={icon} size={24} color="#ffffff" />
      </Animated.View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={color} style={styles.arrow} />
        <Ionicons name="chevron-forward" size={20} color={color} style={styles.arrow} />
        <Ionicons name="chevron-forward" size={20} color={color} style={styles.arrow} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderRadius: 30,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.danger + '30',
  },
  track: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 30,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  arrowContainer: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.5,
  },
  arrow: {
    marginLeft: -8,
  },
});
