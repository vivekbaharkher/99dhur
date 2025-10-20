import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  initialLoadComplete: false,
  loading: false,
  categories: [],
  articleCategoryId: "",
  cacheChat: null,
  agentBookingPreferences: {
    meeting_duration_minutes: 0,
    lead_time_minutes: 0,
    buffer_time_minutes: 0,
    auto_confirm: 0,
    cancel_reschedule_buffer_minutes: 0,
    auto_cancel_after_minutes: 0,
    auto_cancel_message: "",
    daily_booking_limit: 0,
    availability_types: [],
    anti_spam_enabled: false,
    timezone: ""
  }
};

const cacheSlice = createSlice({
  name: "cacheData",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload.data;
    },
    setArticleCategoryId: (state, action) => {
      state.articleCategoryId = action.payload.data;
    },
    setCacheChat: (state, action) => {
      state.cacheChat = action.payload;
    },
    setAgentBookingPreferences: (state, action) => {
      state.agentBookingPreferences = action.payload;
    },
    setInitialLoadComplete(state, action) {
      state.initialLoadComplete = action.payload;
    },

  },
});

export const { setCategories, setArticleCategoryId, setCacheChat, setAgentBookingPreferences, setInitialLoadComplete } =
  cacheSlice.actions;

export default cacheSlice.reducer;
