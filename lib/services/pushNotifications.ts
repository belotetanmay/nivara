/**
 * Send an Expo Push Notification to a mobile client device token.
 */
export async function sendExpoPushNotification(pushToken: string, title: string, body: string, data?: Record<string, any>) {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken[')) {
    console.log(`[Expo Push] Invalid or unformatted push token: ${pushToken}`);
    return { success: false, error: 'Invalid push token format' };
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
      }),
    });

    const resData = await response.json();
    console.log(`[Expo Push Notification Sent]: ${title} -> ${pushToken.substring(0, 20)}...`, resData);
    return { success: true, resData };
  } catch (error: any) {
    console.error('[Expo Push Notification Failed]:', error);
    return { success: false, error: error.message };
  }
}
