import { apiClient } from './api/apiClient';
import { Alert, Linking } from 'react-native';

const CURRENT_APP_VERSION = '1.0.0';

export const versionService = {
  checkVersion: async () => {
    try {
      const response = await apiClient.get('/app-version');
      const { latestVersion, minRequiredVersion, forceUpdate, updateUrl } = response.data;

      if (forceUpdate && CURRENT_APP_VERSION < minRequiredVersion) {
        Alert.alert(
          'Update Required',
          'A mandatory update for NIVARA is available. Please update to continue using the application.',
          [
            {
              text: 'Update Now',
              onPress: () => Linking.openURL(updateUrl),
            },
          ],
          { cancelable: false }
        );
      } else if (latestVersion > CURRENT_APP_VERSION) {
        Alert.alert(
          'Update Available',
          `A new version (${latestVersion}) of NIVARA is available with performance updates.`,
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Update', onPress: () => Linking.openURL(updateUrl) },
          ]
        );
      }
    } catch {
      // Silent fail for version check
    }
  },
};
