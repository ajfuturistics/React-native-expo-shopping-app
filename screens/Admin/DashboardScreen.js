import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Avatar, Card, Divider } from "react-native-paper";

const DashboardScreen = () => {
  return (
    <View>
      <Card.Title
        title="Manage Products"
        subtitle="Add, Update, Delete Products"
        left={() => <Avatar.Icon icon="archive" />}
      />
      <Divider />
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({});
