import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions  } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fff', '#1aea79','#e1dd01']}
        style={styles.gradientBackground}
      >
        {/* Background Image */}

        <Image
          source={require("@/../assets/images/splash-icon.png")}
          style={styles.backgroundImage}
        />

        {/* Content Container */}
<Text style={styles.banner}>Soular</Text>
        <View style={styles.contentContainer}>

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
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: -150,
    resizeMode: 'contain',
    opacity: 0.6, // Optional: make the image semi-transparent
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  titleContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
//     fontFamily: "Yozai-Medium",
    color: 'black',
    textAlign: 'left',
  },
  banner: {
    fontSize: 40,
    fontWeight: '100',
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: "Priestacy"

  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
    marginTop: 10,
//     fontFamily: "Yozai-Medium",
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 0,
    width: '100%',

    borderRadius: 25,
    height: 70,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
  }
});