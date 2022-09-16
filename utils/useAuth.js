import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useDispatch } from "react-redux";
import { login, logout } from "../redux/User/UserSlice";

export function useAuth() {
  const [user, setUser] = React.useState();
  const dispatch = useDispatch();

  React.useEffect(() => {
    const unsubscribeFromAuthStatuChanged = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        console.log("user logged");
        setUser(user);
      } else {
        // User is signed out
        console.log("user not logged");
        setUser(undefined);
        dispatch(logout());
      }
    });

    return unsubscribeFromAuthStatuChanged;
  }, []);

  return {
    user,
  };
}
