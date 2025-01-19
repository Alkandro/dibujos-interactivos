// /screens/HomeScreen.js
import React from "react";
import { View, Button, StyleSheet } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button
        title="Modo Dibujar"
        onPress={() => navigation.navigate("Drawing")}
      />
      <Button
        title="Modo Reflejar"
        onPress={() => navigation.navigate("Reflection")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
