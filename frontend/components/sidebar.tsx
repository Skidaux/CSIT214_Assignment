import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
} from "expo-router/drawer";
import React from "react";
import { useAuth } from "../lib/auth";

import SignOut from "./signout";
export default function Sidebar() {
  const { auth: signed, refresh } = useAuth();
  //Side bar which displays available routes to the User using the drawer component
  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
          {signed.loggedIn ? <SignOut onSignedOut={refresh} /> : null}
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen
        name="index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: "Home",
          title: "Home",
        }}
      />
      <Drawer.Protected guard={!signed.loggedIn}>
        <Drawer.Screen
          name="auth"
          options={{
            drawerLabel: "Authenticate",
            title: "Authenticate",
          }}
        />
      </Drawer.Protected>
      {/* <Drawer.Screen
        name="user/[id]" /
        options={{
          drawerLabel: "User",
          title: "overview",
        }}
      /> */}
      <Drawer.Protected guard={signed.loggedIn}>
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: "Profile",
            title: "Profile",
          }}
        />

        <Drawer.Screen
          name="booking"
          options={{
            drawerLabel: "Booking",
            title: "Booking",
          }}
        />
      </Drawer.Protected>
    </Drawer>
  );
}
