import React, { useState } from 'react'
// import { StripeProvider } from '@stripe/stripe-react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import {
  useFonts,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant-garamond'

import { colors } from './theme'
import HomeScreen from './screens/HomeScreen'
import NewsListScreen from './screens/NewsListScreen'
import ArticleScreen from './screens/ArticleScreen'
import RecordsScreen from './screens/RecordsScreen'
import PlacementsScreen from './screens/PlacementsScreen'
import MoreScreen from './screens/MoreScreen'
import AboutScreen from './screens/AboutScreen'
import ServicesScreen from './screens/ServicesScreen'
import ContactScreen from './screens/ContactScreen'
import PaymentScreen from './screens/PaymentScreen'
import WaterReveal from './components/WaterReveal'

const Tab = createBottomTabNavigator()
const NewsStack = createNativeStackNavigator()
const MoreStack = createNativeStackNavigator()

function NewsNavigator() {
  return (
    <NewsStack.Navigator screenOptions={{ headerShown: false }}>
      <NewsStack.Screen name="NewsList" component={NewsListScreen} />
      <NewsStack.Screen name="Article" component={ArticleScreen} />
    </NewsStack.Navigator>
  )
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} />
      <MoreStack.Screen name="About" component={AboutScreen} />
      <MoreStack.Screen name="Services" component={ServicesScreen} />
      <MoreStack.Screen name="Contact" component={ContactScreen} />
      <MoreStack.Screen name="Payment" component={PaymentScreen} />
    </MoreStack.Navigator>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
  })

  const [splashDone, setSplashDone] = useState(false)

  if (!fontsLoaded) return null

  return (
    <>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.bg,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              height: 70,
              paddingBottom: 12,
              paddingTop: 8,
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.muted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
            tabBarIconStyle: { display: 'none' },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="News" component={NewsNavigator} />
          <Tab.Screen name="Records" component={RecordsScreen} />
          <Tab.Screen name="Placements" component={PlacementsScreen} />
          <Tab.Screen name="More" component={MoreNavigator} />
        </Tab.Navigator>
      </NavigationContainer>
      {!splashDone && <WaterReveal onComplete={() => setSplashDone(true)} />}
    </>
  )
}
