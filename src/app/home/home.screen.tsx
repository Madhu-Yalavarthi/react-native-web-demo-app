import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { BarcodeIcon, CameraIcon, ContactsIcon, QrcodeIcon } from '../icons';

interface MenuIconProps {
  type: string,
  width?: any,
  height?: any
}

const APP_MENU = [
  {
    name: 'Camera',
    icon: 'CAMERA',
    path: 'Camera'
  },
  {
    name: 'Qr Code',
    icon: 'QRCODE',
    path: 'Camera'
  },
  {
    name: 'Barcode',
    icon: 'BARCODE',
    path: 'Camera'
  },
	{
		name: 'Contacts',
		icon: 'CONTACTS',
		path: 'Contacts'
	}
];

function MenuIcon(props: MenuIconProps) {
  const { type, width, height } = props;
  switch (type) {
    case 'CAMERA': return <CameraIcon width={width ? width : '100%'} height={height ? height : '100%'} />;
    case 'QRCODE': return <QrcodeIcon width={width ? width : '100%'} height={height ? height : '100%'} />;
    case 'BARCODE': return <BarcodeIcon width={width ? width : '100%'} height={height ? height : '100%'} />;
		case 'CONTACTS': return <ContactsIcon width={width ? width : '100%'} height={height ? height : '100%'} />;
    default: return <CameraIcon width={width ? width : '100%'} height={height ? height : '100%'} />;
  }
}

export function HomeScreen(props: any) {
  return (
    <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 10 }}>
      {
        APP_MENU.map((doc, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => ([{
              width: 100,
              height: 100,
              marginRight: 10,
							marginBottom: 20,
              borderRadius: 10,
              padding: 10,
            }, { backgroundColor: pressed ? '#0000001d' : '#fff' }])}
            onPress={() => { props.navigation.navigate(doc.path, { type: doc.icon }) }}
          >
            {/* <Text>{doc.name}</Text> */}
            <MenuIcon type={doc.icon} width={"100%"} height={"100%"} />
          </Pressable>
        ))
      }
    </View>
  );
}
