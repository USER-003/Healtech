import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import styles from "../../../../../styles/styles";
import ProtectedRoute from "../../sesion/ProtectedRoute";

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    onSearch(searchText);
  };

  const handleErase = () => {
    setSearchText("");
    onSearch("");
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            padding: 10,
            flex: 1,
            padding: 10,
            backgroundColor: "white",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "black",
          }}
          placeholder=" Buscar por fecha (dia/mes/año)"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity style={{ padding: 10 }} onPress={handleErase}>
            <FontAwesome name="times" size={20} color="black" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={handleSearch}>
          <FontAwesomeIcon icon={faSearch} size={20} color="black" />
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
};

export default SearchBar;
