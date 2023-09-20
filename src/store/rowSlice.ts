import { createSlice } from "@reduxjs/toolkit";

type rowsType = {
  rows: any[];
};

const initialState: rowsType = {
  rows: [],
};

export const rowSlice = createSlice({
  name: "rowSlice",
  initialState,
  reducers: {
    setRows: (state, action) => {
      state.rows = [...state.rows,...action.payload];
    },
  },
});

export const { setRows } = rowSlice.actions;

export default rowSlice.reducer;
