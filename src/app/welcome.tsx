import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions  } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('window');

export default function Welcome() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E0F7FA', '#1aea79','#e1dd01']}
        style={styles.gradientBackground}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/../assets/images/splash-icon.png")}
            style={styles.logo}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>環保，</Text>
          <Text style={styles.title}>聯繫世界</Text>
          <Text style={styles.subtitle}>在這個為地球而建設的避風港，您可以探索即環保資訊，了解環境變化的趨勢；加入志同道合的社群，一起分享行動計劃，攜手守護我們的地球家園。</Text>

        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>START NOW</Text>
            </TouchableOpacity>
          </Link>


        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: screenWidth * 1,
    height: screenHeight * 0.4,

    resizeMode: 'center',
  },
  titleContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
//     paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
    height: 70,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',

  },

  primaryButton:hover {
      backgroundColor: '#1aea79'
      },

  buttonText: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
  }

});