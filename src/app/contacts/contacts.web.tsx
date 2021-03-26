import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text } from 'react-native';

interface Props {

}
export function ContactsWebScreen(props: Props) {
	// const navigation = useNavigation();
	// const [error, setError] = useState<string>();

	useEffect(() => {

		return () => {

		}
	}, [])


	return (
		<View style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center'
		}}>
			<Text style={{ color: 'red' }}>{'Contacts not supported'}</Text>
		</View>
	)

}
