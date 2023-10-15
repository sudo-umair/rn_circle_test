import {Slider} from '@miblanchard/react-native-slider';
import {Fragment, useRef, useState} from 'react';
import {
  Button,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

type Point = {x: number; y: number};
type Path = Point[];

export default function App() {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [path, setPath] = useState<Path>([]);
  const [tolerance, setTolerance] = useState<number>(4);
  const [imagePath, setImagePath] = useState<string>('');

  const ref = useRef<ViewShot>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDrawing(true);
      setPath([]);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (isDrawing) {
        const {moveX, moveY} = gestureState;
        setPath([...path, {x: moveX, y: moveY}]);
      }
    },
    onPanResponderRelease: () => {
      setIsDrawing(false);
      const status = isCircle(path);
      if (status) {
        Alert.alert('Circle');
        captureScreen();
      } else {
        Alert.alert('Not Circle');
      }
    },
  });

  const isCircle = (path: Path): boolean => {
    if (path.length < 3) {
      return false;
    }
    const firstPoint = path[0];
    const lastPoint = path[path.length - 1];
    const radius = Math.sqrt(
      Math.pow(lastPoint.x - firstPoint.x, 2) +
        Math.pow(lastPoint.y - firstPoint.y, 2),
    );

    for (let i = 1; i < path.length - 1; i++) {
      const point = path[i];
      const distance = Math.sqrt(
        Math.pow(point.x - firstPoint.x, 2) +
          Math.pow(point.y - firstPoint.y, 2),
      );
      const calc = Math.abs(distance - radius);
      return calc < tolerance;
    }

    return true;
  };

  const captureScreen = () => {
    if (!ref.current) {
      return;
    }
    ref.current.capture?.().then(uri => {
      setImagePath(uri);
    });
  };

  const clearDrawing = () => {
    setPath([]);
  };

  return (
    <SafeAreaView style={styles.root}>
      {imagePath ? (
        <Fragment>
          <Text style={styles.text}>Screenshot</Text>
          <Image source={{uri: imagePath}} style={{flex: 1}} />
          <Button title="Clear" onPress={() => setImagePath('')} />
        </Fragment>
      ) : (
        <Fragment>
          <ViewShot
            ref={ref}
            style={{flex: 1}}
            options={{
              format: 'png',
              fileName: `${Date.now()}.png`,
              quality: 0.9,
            }}>
            <View style={styles.container} {...panResponder.panHandlers}>
              {path.map((point, index) => (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: point.x - 4,
                    top: point.y - 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'red',
                  }}
                />
              ))}
            </View>
          </ViewShot>
          <View style={styles.slider}>
            <Text style={styles.text}>Tolerance: {tolerance}</Text>
            <Slider
              value={tolerance}
              startFromZero
              step={1}
              minimumValue={1}
              maximumValue={10}
              onValueChange={v => setTolerance(v[0])}
              thumbTintColor={'rgba(0, 0, 0, 0.5)'}
            />
          </View>
          <Button title="Clear" onPress={clearDrawing} />
        </Fragment>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  slider: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
});
