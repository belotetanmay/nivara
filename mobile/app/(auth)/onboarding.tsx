import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGlobalStore } from '../../store/globalStore';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    title: 'Discover',
    subtitle: 'Find certified high-performance wellness vans nearby. Bio-hacking sanctuary at your doorstep.',
    image: require('../../assets/images/onboarding_discover.jpg'),
  },
  {
    title: 'Customize',
    subtitle: 'Configure your sensory trilogy. Fine-tune light, sound, and scent.',
    image: require('../../assets/images/onboarding_customize.jpg'),
  },
  {
    title: 'Reset',
    subtitle: 'Unlock your private pod. Step into a sanctuary of absolute reset and recharge your biology.',
    image: require('../../assets/images/onboarding_reset.jpg'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useGlobalStore((state) => state.completeOnboarding);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const slide = ONBOARDING_SLIDES[currentSlideIndex];

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* NIVARA Brand */}
        <View className="flex-row items-center">
          <Text className="text-[#0F2D52] text-xl font-bold tracking-widest font-serif">NIVARA</Text>
        </View>
        <TouchableOpacity onPress={finishOnboarding}>
          <Text className="text-gray-500 font-semibold text-sm">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Visual illustration / image */}
      <View className="flex-1 justify-center items-center px-6">
        <View style={styles.circleContainer} className="rounded-full items-center justify-center mb-8 overflow-hidden shadow-sm border border-[#E5E1D8]">
          <Image
            source={slide.image}
            style={styles.slideImage}
            resizeMode="cover"
          />
        </View>

        {/* Text */}
        <Text className="text-[#0F2D52] text-3xl font-bold font-serif mb-3 text-center">
          {slide.title}
        </Text>
        <Text className="text-gray-600 text-base text-center leading-6 px-4">
          {slide.subtitle}
        </Text>
      </View>

      {/* Slide Indicators */}
      <View className="flex-row justify-center items-center mb-8">
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            className={`h-2.5 rounded-full mx-1 ${
              index === currentSlideIndex ? 'w-6 bg-[#0F2D52]' : 'w-2.5 bg-[#E5E1D8]'
            }`}
          />
        ))}
      </View>

      {/* Bottom Action */}
      <View className="px-6 pb-8">
        <Button
          title={currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? "Enter Sanctuary" : "Next →"}
          onPress={handleNext}
          variant="primary"
          className="w-full py-4 rounded-xl"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  circleContainer: {
    width: 256,
    height: 256,
    backgroundColor: '#E5E1D8',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
});
