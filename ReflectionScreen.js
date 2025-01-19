import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig";

const ReflectionScreen = () => {
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const drawingRef = ref(database, "drawing");

    // Escuchar cambios en la base de datos
    const unsubscribe = onValue(drawingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.paths) {
        setPaths(data.paths); // Actualizar los trazos recibidos
      }
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Svg style={styles.canvas}>
        {/* Dibujar todos los trazos recibidos */}
        {paths.map((path, index) => (
          <Path key={index} d={path} stroke="blue" strokeWidth={3} fill="none" />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  canvas: {
    flex: 1,
  },
});

export default ReflectionScreen;
