import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function ResultScreen(props: any) {
    const { navigation, route } = props;
    const { name, params } = route;

    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 43 }}>{params.type}</Text>
            <Text style={{ color: 'red', fontSize: 25, marginTop: 25 }}>{params.data}</Text>
        </View>
    )
}