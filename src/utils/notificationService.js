import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PermissionsAndroid} from 'react-native';
import notifee from '@notifee/react-native';
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  }
}

const getFcmToken = async() => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log(fcmToken, "old token")
    if(!fcmToken) {
    try{
    const fcmToken = await messaging().getToken();
        if(fcmToken){
        console.log(fcmToken, "the new generated token");
        await AsyncStorage.setItem('fcmToken', fcmToken)
        }
    } catch (error) {
    console.log(error, "error occurred in fcm Token");
    }
    }
}

export const notificationListener = async() => {
   // Create a channel (required for Android)
   const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });
 messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    messaging().onMessage(async remoteMessage => {
    console.log("received in background", remoteMessage);

   
    })

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      const {notification}=remoteMessage;
      console.log('Message handled in the background!', remoteMessage.notification);

      notification || await notifee.displayNotification({
        title: 'Notification Title',
        body: 'Main body content of the notification',
        android: {
          channelId,
         
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
      
    });

   
        // Check whether an initial notification is available
        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log(
                'Notification caused app to open from quit state:',
                remoteMessage.notification,
              );
            }
          });
}