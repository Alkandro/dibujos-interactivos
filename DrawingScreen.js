import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ref, set } from "firebase/database";
import { database } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const DrawingScreen = () => {
  const [paths, setPaths] = useState([]); // Array de trazos
  const [currentPath, setCurrentPath] = useState("");
  const [previewPaths, setPreviewPaths] = useState([]); // Trazos enviados (previsualización)
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false); // Estado para expandir/cerrar la previsualización

  // Calcular dinámicamente el viewBox
  const calculateViewBox = () => {
    if (previewPaths.length === 0) {
      return "0 0 100 100"; // Si no hay trazos, usar un viewBox predeterminado
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    previewPaths.forEach((path) => {
      const points = path.match(/[ML]\d+(\.\d+)? \d+(\.\d+)?/g); // Extraer puntos (M o L)
      if (!points) return;

      points.forEach((point) => {
        const [, x, y] = point.match(/[ML](\d+(\.\d+)?) (\d+(\.\d+)?)/).map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      });
    });

    const width = maxX - minX || 100;
    const height = maxY - minY || 100;
    return `${minX} ${minY} ${width} ${height}`;
  };

  // Manejar inicio del dibujo
  const handleTouchStart = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const newPath = `M${locationX} ${locationY}`;
    setCurrentPath(newPath);
  };

  // Manejar movimiento del dibujo
  const handleTouchMove = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const updatedPath = `${currentPath} L${locationX} ${locationY}`;
    setCurrentPath(updatedPath);
  };

  // Manejar fin del dibujo
  const handleTouchEnd = () => {
    setPaths((prevPaths) => [...prevPaths, currentPath]);
    setCurrentPath("");
  };

  // Enviar dibujo a Firebase
  const handleSend = async () => {
    try {
      if (paths.length === 0) {
        Alert.alert("Aviso", "No hay trazos para enviar.");
        return;
      }

      const drawingRef = ref(database, "drawing");
      await set(drawingRef, { paths });

      // Actualizar previsualización con los trazos enviados
      setPreviewPaths(paths);

      Alert.alert("Éxito", "Dibujo enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar el dibujo:", error);
      Alert.alert("Error", "Hubo un problema al enviar el dibujo. Inténtalo de nuevo.");
    }
  };

  // Borrar todo el dibujo
  const handleClear = async () => {
    try {
      setPaths([]); // Limpiar trazos locales
      const drawingRef = ref(database, "drawing");
      await set(drawingRef, { paths: [] }); // Limpiar en Firebase

      Alert.alert("Éxito", "Se borró el dibujo correctamente.");
    } catch (error) {
      console.error("Error al borrar el dibujo:", error);
      Alert.alert("Error", "Hubo un problema al borrar el dibujo. Inténtalo de nuevo.");
    }
  };

  // Deshacer último trazo
  const handleUndo = () => {
    setPaths((prevPaths) => prevPaths.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      {/* Barra de botones */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleUndo} style={styles.button}>
          <Ionicons name="arrow-undo-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSend} style={styles.button}>
          <Ionicons name="send-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={styles.button}>
          <Ionicons name="trash-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Canvas de dibujo */}
      <View
        style={[
          styles.canvas,
          isPreviewExpanded && styles.canvasCollapsed,
        ]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Svg style={styles.svgCanvas}>
          {paths.map((path, index) => (
            <Path key={index} d={path} stroke="black" strokeWidth={3} fill="none" />
          ))}
          {currentPath && (
            <Path d={currentPath} stroke="black" strokeWidth={3} fill="none" />
          )}
        </Svg>
      </View>

      {/* Previsualización */}
      <View
        style={[
          styles.previewContainer,
          isPreviewExpanded && styles.previewExpanded,
        ]}
      >
        <TouchableOpacity
          onPress={() => setIsPreviewExpanded((prev) => !prev)}
          style={styles.dropdownButton}
        >
          <Ionicons
            name={isPreviewExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
        {isPreviewExpanded && (
          <Svg
            style={styles.previewCanvas}
            viewBox={calculateViewBox()}
            preserveAspectRatio="xMidYMid meet"
          >
            {previewPaths.map((path, index) => (
              <Path key={index} d={path} stroke="blue" strokeWidth={1} fill="none" />
            ))}
          </Svg>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  toolbar: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    zIndex: 5, // Asegura que la barra esté siempre visible
  },
  button: {
    padding: 10,
  },
  canvas: {
    flex: 1,
  },
  canvasCollapsed: {
    flex: 0,
  },
  svgCanvas: {
    flex: 1,
  },
  previewContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f9f9f9",
  },
  previewExpanded: {
    position: "absolute",
    top: 60, // Deja espacio para la barra de botones
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  dropdownButton: {
    alignItems: "center",
    padding: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    margin: 5,
  },
  previewCanvas: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default DrawingScreen;
