import React, { useRef } from "react";
import LottieView from "lottie-react-native";

const Loader = () => {
  const animation = useRef(null);

  return (
    <LottieView
      autoPlay
      loop
      ref={animation}
      style={{
        width: 200,
        height: 200,
      }}
      source={require("../../assets/loader.json")}
    />
  );
};

export default Loader;
