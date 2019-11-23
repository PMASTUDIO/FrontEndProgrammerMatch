import React, { Component } from "react";
import PropTypes from "prop-types";

import { StatusBar, AsyncStorage, View, SafeAreaView } from "react-native";
import { StackActions, NavigationActions } from "react-navigation";

import api from "../../services/api";

import {
  Container,
  Logo,
  Input,
  ErrorMessage,
  Button,
  ButtonText,
  SignUpLink,
  SignUpLinkText
} from "./styles";

export default class SignUp extends Component {
  static navigationOptions = {
    header: null
  };

  constructor() {
    super();
    this.state = {
      username: "",
      email: "",
      password: "",
      error: "",
      success: ""
    };
  }

  handleUsernameChange = username => {
    this.setState({ username });
  };

  handleEmailChange = email => {
    this.setState({ email });
  };

  handlePasswordChange = password => {
    this.setState({ password });
  };

  handleCreateAccountPress = () => {
    this.props.navigation.navigate("SignUp");
  };

  handleSignUpPress = async () => {
    if (this.state.email.length === 0 || this.state.password.length === 0) {
      this.setState(
        { error: "Preencha usuário e senha para continuar!" },
        () => false
      );
    } else {
      try {
        const response = await api.post("/register", {
          username: this.state.username,
          email: this.state.email,
          password: this.state.password
        });

        this.setState({ success: "Conta criada com sucesso!", error: "" });

        setTimeout(this.goToLogin, 2500);
      } catch (_err) {
        this.setState({
          error:
            "Houve um problema com o cadastro, verifique os dados preenchidos!"
        });
      }
    }
  };

  goToLogin = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "SignIn" })]
    });
    this.props.navigation.dispatch(resetAction);
  };

  render() {
    return (
      <Container>
        <StatusBar hidden />
        <Logo source={require("../../images/logo.png")} resizeMode="contain" />
        <Input
          placeholder="Seu username"
          value={this.state.username}
          onChangeText={this.handleUsernameChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          placeholder="Endereço de e-mail"
          value={this.state.email}
          onChangeText={this.handleEmailChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          placeholder="Senha"
          value={this.state.password}
          onChangeText={this.handlePasswordChange}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        {this.state.error.length !== 0 && (
          <ErrorMessage>{this.state.error}</ErrorMessage>
        )}
        <Button onPress={this.handleSignInPress}>
          <ButtonText>Entrar</ButtonText>
        </Button>
        <SignUpLink onPress={this.handleCreateAccountPress}>
          <SignUpLinkText>Criar conta grátis</SignUpLinkText>
        </SignUpLink>
      </Container>
    );
  }

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func
    }).isRequired
  };
}
