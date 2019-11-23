import React from "react";
import {
  StyleSheet,
  Image,
  View,
  Dimensions,
  Animated,
  PanResponder,
  Text,
  Modal,
  TouchableOpacity
} from "react-native";

import { Feather as Icon } from "@expo/vector-icons";

import PropTypes from "prop-types";
import api from "../../services/api";

import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

import {
  CancelButtonContainer,
  SelectButtonContainer,
  ButtonText,
  ModalContainer,
  ModalImagesListContainer,
  ModalImagesList,
  ModalImageItem,
  ModalButtons,
  CameraButtonContainer,
  CancelButtonText,
  ContinueButtonText,
  TakePictureButtonContainer,
  TakePictureButtonLabel,
  DataButtonsWrapper,
  Form,
  Input,
  DetailsModalFirstDivision,
  DetailsModalSecondDivision,
  DetailsModalBackButton,
  DetailsModalProfileTitle
} from "./styles";

// const profile = [
//   {
//     id: "1",
//     name: "Bill Gates",
//     uri: require("../../../assets/billgates.jpg")
//   },
//   { id: "2", name: "Cheryl", uri: require("../../../assets/cheryl.jpg") },
//   { id: "3", name: "Savils", uri: require("../../../assets/savils.jpg") },
//   {
//     id: "4",
//     name: "Mark Zuckerberg",
//     uri: require("../../../assets/zuckerberg.jpg")
//   }
// ];

export default class Main extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        params: PropTypes.shape({
          token: PropTypes.string
        })
      })
    }).isRequired
  };

  constructor() {
    super();
    this.position = new Animated.ValueXY();
    this.state = {
      currentIndex: 0,
      profiles: [],
      cameraModalOpened: false,
      dataModalOpened: false,
      profileData: {
        title: "",
        images: []
      },
      hasCameraPermission: true,
      type: Camera.Constants.Type.back
    };

    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
      extrapolate: "clamp"
    });

    this.rotateAndTranslate = {
      transform: [
        {
          rotate: this.rotate
        },
        ...this.position.getTranslateTransform()
      ]
    };

    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: "clamp"
    });

    this.nopeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: "clamp"
    });

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: "clamp"
    });

    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: "clamp"
    });
  }

  componentWillMount() {
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: {
              x: SCREEN_WIDTH + 100,
              y: gestureState.dy
            }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: {
              x: -SCREEN_WIDTH - 100,
              y: gestureState.dy
            }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4
          }).start();
        }
      }
    });
  }

  async componentDidMount() {
    try {
      const res = await api.get("/profile", {});
      this.setState({ profiles: res.data });
    } catch (err) {
      return err;
    }
  }

  renderProfile = () => {
    return this.state.profiles
      .map((item, i) => {
        if (i < this.state.currentIndex) {
          return null;
        } else if (i == this.state.currentIndex) {
          return (
            <Animated.View
              {...this.PanResponder.panHandlers}
              key={i}
              style={[
                this.rotateAndTranslate,
                {
                  height: SCREEN_HEIGHT - 120,
                  width: SCREEN_WIDTH,
                  padding: 10,
                  position: "absolute"
                }
              ]}
            >
              <Animated.View
                style={{
                  opacity: this.likeOpacity,
                  transform: [{ rotate: "-30deg" }],
                  position: "absolute",
                  top: 50,
                  left: 40,
                  zIndex: 1000
                }}
              >
                <Text
                  style={{
                    borderWidth: 4,
                    borderColor: "green",
                    color: "green",
                    fontSize: 32,
                    fontWeight: "800",
                    padding: 10
                  }}
                >
                  LIKE
                </Text>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: this.nopeOpacity,
                  transform: [{ rotate: "30deg" }],
                  position: "absolute",
                  top: 50,
                  right: 40,
                  zIndex: 1000
                }}
              >
                <Text
                  style={{
                    borderWidth: 4,
                    borderColor: "red",
                    color: "red",
                    fontSize: 32,
                    fontWeight: "800",
                    padding: 10
                  }}
                >
                  NOPE
                </Text>
              </Animated.View>

              <Image
                style={{
                  flex: 1,
                  height: null,
                  width: null,
                  resizeMode: "cover",
                  borderRadius: 20
                }}
                source={{
                  uri: `http://5a355bcd.ngrok.io/images/${item.images[0].path}`
                }}
              />
              <Text style={styles.name}>{item.title}</Text>
            </Animated.View>
          );
        } else {
          return (
            <Animated.View
              key={i}
              style={{
                opacity: this.nextCardOpacity,
                transform: [{ scale: this.nextCardScale }],
                height: SCREEN_HEIGHT - 120,
                width: SCREEN_WIDTH,
                padding: 10,
                position: "absolute"
              }}
            >
              <Image
                style={{
                  flex: 1,
                  height: null,
                  width: null,
                  resizeMode: "cover",
                  borderRadius: 20
                }}
                source={{
                  uri: `http://5a355bcd.ngrok.io/images/${item.images[0].path}`
                }}
              />
            </Animated.View>
          );
        }
      })
      .reverse();
  };

  handleCameraModalOpenClose = () =>
    this.setState({ cameraModalOpened: !this.state.cameraModalOpened });

  handleTakePicture = () => {};

  renderImageList = () => {};

  handleDataModalClose = () => {};

  renderCameraModal = () => {
    <Modal
      visible={this.state.cameraModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleCameraModalOpenClose}
    >
      <ModalContainer>
        <View style={{ flex: 1 }}>
          <Camera
            style={{ flex: 1 }}
            type={this.state.type}
            ref={camera => {
              this.camera = camera;
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row"
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: "flex-end",
                  alignItems: "center"
                }}
                onPress={() => {
                  this.setState({
                    type:
                      this.state.type === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back
                  });
                }}
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                >
                  Flip
                </Text>
              </TouchableOpacity>
            </View>
            <TakePictureButtonContainer onPress={this.handleTakePicture}>
              <TakePictureButtonLabel />
            </TakePictureButtonContainer>
          </Camera>
        </View>
      </ModalContainer>
      {/*this.renderImageList()*/}
      <ModalButtons>
        <CameraButtonContainer onPress={this.handleCameraModalOpenClose}>
          <CancelButtonText>Cancelar</CancelButtonText>
        </CameraButtonContainer>
        <CameraButtonContainer onPress={this.handleDataModalClose}>
          <ContinueButtonText>Cancelar</ContinueButtonText>
        </CameraButtonContainer>
      </ModalButtons>
    </Modal>;
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 60 }}>
          <View style={styles.header}>
            <Icon
              name="user"
              size={32}
              color="grey"
              onPress={this.handleCameraModalOpenClose()}
            />
            <Icon name="message-circle" size={32} color="grey" />
          </View>
        </View>
        <View style={{ flex: 1 }}>{this.renderProfile()}</View>
        <View style={{ height: 60 }}>
          <View style={styles.footer}>
            <View style={styles.circle}>
              <Icon name="x" size={32} color="#ec5288" />
            </View>
            <View style={styles.circle}>
              <Icon name="heart" size={32} color="#6ee3b4" />
            </View>
          </View>
        </View>

        {this.renderCameraModal()}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 25
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 0
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "gray",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2
  },
  name: {
    color: "white",
    fontSize: 32,
    position: "absolute",
    padding: 20,
    fontWeight: "bold"
  }
});
