import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Pressable, Text, FlatList, ActivityIndicator } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';
import { Contact } from '../interfaces';


interface Props {

}
export function ContactsScreen(props: Props) {
	const navigation = useNavigation();
	const [contacts, setContacts] = useState<Contacts.Contact[]>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
			{
				'title': 'Contacts',
				'message': 'This app would like to view your contacts.',
				'buttonPositive': 'Please accept bare mortal'
			}
		)
			.then(res => Contacts.getAll())
			.then(contacts => {
				console.log(contacts);
				setContacts(contacts);
			})
			.catch(error => {
				setError(error.message);
			})

		return () => {

		}
	}, [])



	if (error) {
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

	if (!contacts) return (
		<View style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center'
		}}>
			{/* <Pressable
				onPress={() => {
					PermissionsAndroid.request(
						PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
						{
							'title': 'Contacts',
							'message': 'This app would like to view your contacts.',
							'buttonPositive': 'Please accept bare mortal'
						}
					)
						.then(res => Contacts.getAll())
						.then(contacts => {
							console.log(contacts);
						})
				}}
				style={({ pressed }) => ({
					backgroundColor: pressed ? '#000000' : 'green',
					width: '50%',
					height: 50,
					borderRadius: 10,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				})}
			>
				<Text style={{ color: '#fff', fontWeight: 'bold' }}>Sync Contacts</Text>
			</Pressable> */}
			<ActivityIndicator color={'green'} size={50}></ActivityIndicator>

		</View>
	);

	return (


		<View style={{
			flex: 1,
			flexDirection: 'column'
		}}>
			<FlatList
				data={contacts}
				renderItem={({ item, index }) => {
					return (
						<Pressable
							onPress={() => { }}
							style={({ pressed }) => ({
								backgroundColor: pressed ? '#0000003b' : '#fefefe',
								width: '100%',
								paddingTop: 20,
								paddingBottom: 20,
								paddingLeft: 30,
								paddingRight: 30,
								display: 'flex',
								borderBottomWidth: 2,
								borderBottomColor: '#fcfcfc'
							})}
						>
							<Text style={{ color: '#000', }}>{item.displayName}</Text>
						</Pressable>
					)
				}}
				keyExtractor={item => item.recordID}
			/>
		</View>
	)

}
