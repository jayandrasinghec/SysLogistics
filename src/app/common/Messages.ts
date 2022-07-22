export class Messages {
    // messages type
    static POPUP: string = "popup";
    static ALERT: string = "alert";

    // titles
    static CONFIRM_TITLE: string = "Confirm";
    static TIMEOUT_TITLE: string = "Timeout";
    static SEARCH_ORDER_TITLE: string = "Search Order";
    static ERROR_TITLE: string = "Error";
    static WARNING_TITLE: string = "Warning";
    static SIGNOUT_TITLE: string = "Sign Out";
    static CANCEL_BOOKING_TITLE: string = "Cancel Booking";
    static CLOSE_TITLE: string = "Close";
    static SAVE_ORDER_TITLE: string = "Save Order";
    static DELETE_TITLE: string = "Delete";
    static SEARCH_TITLE: string = "Search";

    // confirmation messages
    static SAVE_CHANGES: string = "Changes not saved. Do you want to save your changes?";
    static CONFIRM_EXIT: string = "Are you sure you want to exit?";
    static CONFIRM_SIGNOUT: string = "Are you sure you want to sign out?";
    static CONFIRM_EXIT_BOOKING: string = "Are you sure you want to exit from current booking. And continue with the search order?";
    static CONFIRM_DELETE_ROW: string = "Are you sure you want to delete this row?";
    static CONFIRM_DELETE_MASTER_ROW: string = "Deleting master order will delete associated consolidation orders. Do you want to delete master order?";
    static CONFIRM_CANCEL_BOOKING: string = "Are you sure you want to cancel booking?";
    static CONFIRM_CLOSE: string = "Are you sure you want to close?";
    static CONFIRM_CLOSE_FORM: string = "Are you sure you want to close the form?";
    static CONFIRM_SAVE_ORDER: string = "Once order is saved you cannot make any changes. Are you sure you want to save the order?";

    // messages
    static SESSION_TIMEOUT: string = "Due to inactivity for past few minutes, you will be logged out. Please login again to continue.";
    static NO_RECORDS: string = "No record available for the search order Id.";
    static SERVER_ERROR: string = "Server error on search text. Please contact server admin.";
    static ENTER_VALID_NAME: string = "Please enter valid name on card.";
    static OPERATION_NOT_SAVED: string = "Operation is not saved. Please save.";
    static CARRIER_CODE_IN_USE: string = "Carrier Code already used in this order. Please select other.";
    static NO_AGENT: string = "No agent available.";

    // warning messages
    static WARNING_TOTAL_PIECES: string = "Total pieces must be equal to the freight pieces.";
    static WARNING_CHANGING_BILL_NAME: string = "Changing Bill To name will affect service level also.";

    // truck alert error messages
    static ERROR_DELIVER_DATE: string = "Delivery Date must be greater or equal to Load Date.<br>";
    static ERROR_DELIVER_TIME: string = "Load Time From must be less than Load Time To.";
    static ERROR_LOAD_TIME: string = "Delivery Date must be greater or equal to Load Date.<br>";
}