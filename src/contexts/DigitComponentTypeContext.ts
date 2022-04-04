import {createContext, useContext} from "react";
import {DigitComponentType} from "../components/sudoku/digit/DigitComponentType";
import {RegularDigitComponentType} from "../components/sudoku/digit/RegularDigit";

export const DigitComponentTypeContext = createContext<DigitComponentType>(RegularDigitComponentType);

export const useDigitComponentType = () => useContext(DigitComponentTypeContext);
