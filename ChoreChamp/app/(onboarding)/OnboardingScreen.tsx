import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = () => {
  return (
    <Onboarding
        pages={[
            {     
            backgroundColor: '#a6e4d0', 
            image: <Image source={require('../../assets/images/Logo.png')} />, 
            title: 'Welcome to ChoreChamp', 
            subtitle: 'Done with React Native Onboarding Swiper'
         },  
       ]}
    />
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({});