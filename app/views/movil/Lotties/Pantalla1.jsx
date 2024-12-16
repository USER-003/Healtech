import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const WelcomeScreen = () => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require('../../../../assets/fonts/CeraRoundProLight.otf'),
    CeraRoundProRegular: require('../../../../assets/fonts/CeraRoundProRegular.otf'),
    CeraRoundProBlack: require('../../../../assets/fonts/CeraRoundProBlack.otf'),
    CeraRoundProBold: require('../../../../assets/fonts/CeraRoundProBold.otf'),
    CeraRoundProMedium: require('../../../../assets/fonts/CeraRoundProMedium.otf'),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter();

  const carouselItems = [
    {
      animation: require('../../../../assets/animations/1.json'),
      title: '¿Qué es HealTech?',
      subtitle:
      'HealTech es una plataforma que integra tecnología y salud para ofrecer soluciones médicas innovadoras y accesibles.',

    },
    {
      animation: require('../../../../assets/animations/2.json'),
      title: '¿Cómo funciona HealTech?',
      subtitle:
        'Solo necesitas tu número de DUI o expediente para acceder a cualquier lugar médico, público o privado.',
    },
    {
      animation: require('../../../../assets/animations/3.json'),
      title: 'Tu salud en control',
      subtitle:
        'Lleva un registro detallado de tus recetas y organiza tu vida con recordatorios y mejor gestión.',
    },
  ];

  // Duplicamos los elementos para simular un carrusel infinito
  const infiniteItems = [...carouselItems, ...carouselItems, ...carouselItems];
  const totalItems = carouselItems.length;
  const middleIndex = totalItems; // Ajustamos el middleIndex

  // Prevenimos que la Splash Screen se oculte automáticamente
  useEffect(() => {
    async function preventAutoHide() {
      await SplashScreen.preventAutoHideAsync();
    }
    preventAutoHide();
  }, []);

  // Ocultamos la Splash Screen cuando las fuentes estén cargadas
  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }
    hideSplashScreen();
  }, [fontsLoaded]);

  // Inicializamos el FlatList cuando la app está lista
  useEffect(() => {
    if (appIsReady && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: middleIndex, animated: false });
      setCurrentIndex(0); // Establecemos el índice actual en 0
    }
  }, [appIsReady]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Aseguramos que la Splash Screen se oculta cuando la vista raíz está lista
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  const renderItem = ({ item }) => (
    <View style={styles.carouselItem}>
      <LottieView source={item.animation} autoPlay loop style={styles.animation} />
      <Text style={[styles.title, { fontFamily: 'CeraRoundProBold' }]}>{item.title}</Text>
      <Text style={[styles.subtitle, { fontFamily: 'CeraRoundProLight' }]}>{item.subtitle}</Text>
      {/* Renderizamos los puntos aquí */}
      <View style={styles.dotsContainer}>
        {carouselItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );

  // Función de módulo ajustada para manejar números negativos
  const modulo = (a, b) => ((a % b) + b) % b;

  const onScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    const newIndex = modulo(index, totalItems);
    setCurrentIndex(newIndex);
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <FlatList
        data={infiniteItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        ref={flatListRef}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('./views/movil/login/Login')}
      >
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselItem: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 24,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20, // Nuevo estilo agregado
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // Ajusta este valor para posicionar los puntos
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#45B5A9',
  },
  inactiveDot: {
    backgroundColor: '#DDD',
  },
  button: {
    backgroundColor: '#45B5A9',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#45B5A9',
    marginBottom: 60, // Nuevo estilo agregado
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WelcomeScreen;






