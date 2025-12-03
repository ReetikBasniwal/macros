import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function BottomSheet({ isVisible, onClose, children }: BottomSheetProps) {
    const backgroundColor = useThemeColor({}, 'card')
    const borderColor = useThemeColor({}, 'border')
    const activeColor = useThemeColor({}, 'tabIconSelected')
    const inactiveColor = useThemeColor({}, 'tabIconDefault')
    const [showModal, setShowModal] = useState(isVisible);
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            setShowModal(true);
            translateY.value = withTiming(0, { duration: 300 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
                runOnJS(setShowModal)(false);
            });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [isVisible]);

    const pan = Gesture.Pan()
        .onChange((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd(() => {
            if (translateY.value > 100) {
                runOnJS(onClose)();
            } else {
                translateY.value = withSpring(0, { damping: 15 });
            }
        });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const sheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Modal transparent visible={showModal} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay} testID="bottom-sheet-overlay">
                <Animated.View style={[styles.backdrop, backdropStyle]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                </Animated.View>
                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        {children}
                    </Animated.View>
                </GestureDetector>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        minHeight: "94%",
        width: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
});
