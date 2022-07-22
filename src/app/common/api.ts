import { environment } from 'src/environments/environment';
const BASEPATH: string = `execute-api.us-west-2.amazonaws.com/${environment.type}/shotrak`;
const UTILITIES_PATH: string = `https://id4lilokp5.${BASEPATH}/reference/utilities`;

export class API{
    public static RULES_API: string = `https://hbrxma9rna.${BASEPATH}/order/rules`;
    public static ORDER_STATUS_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/status`;

    //auth.service
    public static LOGIN_API: string =`https://1v39e1grk7.${BASEPATH}/users/login`;

    //bilto.service
    public static BILL_TO_NAME_SEARCH_API: string =`https://h38kbmemk5.${BASEPATH}/accounts?billToName=`; //${term}
    
    public static GET_BOOKING_AGENT_API: string =`https://ikv8g98pl5.${BASEPATH}/accounts/agents/bookingagents?customer_code=`; //need to add customer code
    
    public static GET_INTEL_LOCATIONS_API: string = `https://kd34hxmb8j.${BASEPATH}/accounts/intel/locations`;
    public static GET_BOOKING_MEHTODES_API: string = `https://hzd6jfzm2b.${BASEPATH}/accounts/bookingmethods`;
    public static GET_REBATE_AGENTS_API: string = `https://ikv8g98pl5.${BASEPATH}/accounts/agents/rebateagents`;
    public static GET_AIRPORT_CODE_API: string = `https://hsge8o181c.${BASEPATH}/accounts/airportcodes`
    public static GET_CREDITCARD_INFO_API: string = `https://p04lh9qaik.${BASEPATH}/customer/`; // ${epay_customer_number}/creditinfo/cards
    public static SAVE_CREDITCARD_INFO_API: string = `https://p04lh9qaik.${BASEPATH}/customer/creditinfo/cards`;
    public static GET_SPECIAL_ACCOUNT_API: string = `https://iuxyekvfkk.${BASEPATH}/specialaccounts/billing`; //need to add ${bookingID}

    //booking.service
    public static CREATE_BOOKING_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order`;
    public static SAVE_BOOKING_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order?submit_order=`; //need to add true /false
    public static GET_BOOKING_DATA_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order/search?bookingid=`; //${bookingID}
    public static GET_ORDER_DATA_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order/search?orderid=`; //${orderID}
    public static GET_ORDER_HISTORY_DATA_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order/history/search?orderid=`; //${orderID}
    public static GET_NTS_DATA_API: string = `https://0v5z4nyp4e.${BASEPATH}/nts`;
    public static SAVE_CONSOLIDATE_ORDER_API: string = `https://bnfaq6fff4.${BASEPATH}/customer/orderconsolidation`;
    public static GET_CONSOLIDATE_ORDER_API: string = `https://bnfaq6fff4.${BASEPATH}/customer/orderconsolidation?consolidated_orderid=`; //${order_ID} 
     
    // customerNotification.service

    public static GET_CUSTOMER_NOTIFICATION_API: string = `https://qspduy8qi5.${BASEPATH}/customer/notifications?bookingid=`; //${bookingID}
    public static CREATE_CUSTOMER_NOTIFICATION_API: string = `https://qspduy8qi5.${BASEPATH}/customer/notifications`;

    // dashboard.service.ts    

    // noMoveStatus.service.ts    
    public static GET_NO_MOVES_API: string = `https://3vwf9sdfx5.${BASEPATH}/order/`;// ${orderId}/nomovenotes

    //notes.service.ts
    public static GET_NOTES_DATA_API: string = `https://0j0w9v5xo2.${BASEPATH}/order/notes/search?bookingid=`; //${bookingID}
    public static CREATE_NOTES_DATA_API: string =  `https://0j0w9v5xo2.${BASEPATH}/order/`; //${bookingID}/notes

    //operation.service.ts
    public static GET_CARRIERS_API: string = `https://2mg6z4p2x3.${BASEPATH}/orders/`; //${orderId}/carriers    
    public static SAVE_CARRIERS_DATA_API: string = `https://2mg6z4p2x3.${BASEPATH}/orders/carriers`;    
    public static GET_FIELD_SERVICE_AGENTS_API: string = `https://a25fzvqkeg.${BASEPATH}/orders/agents?orderid=`; // ${orderId}
    public static SAVE_FIELD_SERVICE_AGENTS_API: string = `https://a25fzvqkeg.${BASEPATH}/orders/agents`;
    public static UPLOAD_FILE_API: string = `https://3gjoebspt9.${BASEPATH}/filemanager/uploadfile`;
    public static GET_FILES_API: string =  `https://3gjoebspt9.${BASEPATH}/filemanager/filedetails`; //${orderId}
    public static DELETE_FILE_DETAILS_API: string = `https://3gjoebspt9.${BASEPATH}/filemanager/deletefiledetail/`; //${file_ID}
    public static UPLOAD_FILE_DESCRIPTION_API: string =  `https://3gjoebspt9.${BASEPATH}/filemanager/updatefiledescription`;
    public static GET_UPLOADED_FILE_API: string = `https://3gjoebspt9.${BASEPATH}/filemanager/uploadedfile/`; //${file_ID}
    public static GET_ORIGIN_DESTINATION_CARRIERLIST_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/carrier-list?orderid=`; //${order_ID}
    public static GET_ORDER_ROUTING_CONFIG_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/notification/config?orderid=`; //${order_ID}
    public static GET_ROUTING_NOTIFICATION_LOGS_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/notification/log?orderid=`; //${order_ID}
    public static SAVE_ROUTING_LOGS_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/notification/log`;
    public static DELETE_ROUTING_LOGS_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/notification/log?emaillogid=`; //${emaillogid}
    public static GET_ROUTING_NOTES_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/notes?orderid=`; //${order_ID}
    public static SAVE_ROUTING_NOTES_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/notes`;
    public static UPDATE_WEIGHT_PIECES_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order/weight`;
    
    public static SAVE_LABEL_API: string = `https://42rplx5v1d.${BASEPATH}/routing/label`; 
    public static GET_LABEL_API: string = `https://42rplx5v1d.${BASEPATH}/routing/label?orderid=`;//${order_Id}
    
    public static GET_ROUTING_DETAIL_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/detail?orderid=`; //${orderId}
    public static GET_ROUTING_ATTACHMENT_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/attachment?orderid=`; //${orderId}
    public static SAVE_ROUTING_DETAIL_API: string =  `https://4e5ctfg3n5.${BASEPATH}/order/routing/detail`;
    public static SAVE_ROUTING_ATTACHMENT_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/attachment`; 
    
  
    public static SAVE_PICKUP_DELIVERY_ALERT_API: string = `https://oh98exni17.${BASEPATH}/pickupdelivery/alert`;
    public static GET_PICKUP_DELIVERY_ALERT_API: string = `https://oh98exni17.${BASEPATH}/pickupdelivery/alert?orderid=`; //${orderId}&alerttype=${type}
   
    public static GET_TRUCK_ALERT_API: string = `https://jzwssd47od.${BASEPATH}/truck/alert?orderid=`; //${orderId}
    public static SAVE_TRUCK_ALERT_API: string =  `https://jzwssd47od.${BASEPATH}/truck/alert`;
   
    public static SAVE_ROUTING_AGENT_API: string =  `https://4e5ctfg3n5.${BASEPATH}/order/routing/agent`;
    public static GET_ROUTING_AGENT_API: string = `https://4e5ctfg3n5.${BASEPATH}/order/routing/agent?orderid=`; //${order_id}
    
    public static GET_ROUTING_ALERT_API: string = `https://kwrk7scgsa.${BASEPATH}/routing/alert?orderid=`; //${orderId}
    public static SAVE_ROUTING_ALERT_API: string = `https://kwrk7scgsa.${BASEPATH}/routing/alert`;

    public static GET_SERVICE_FAILURE_API: string =`https://9gakp3em77.${BASEPATH}/order/service/failure?orderid=`; //${orderId}
    public static GET_SERVICE_FAILURE_ATTACHMENT_API: string = `https://9gakp3em77.${BASEPATH}/order/service/failure/attachment?orderid=`; //${orderId}
    public static SAVE_SERVICE_FAILURE_API: string = `https://9gakp3em77.${BASEPATH}/order/service/failure`;    
    public static SAVE_SERVICE_FAILURE_ATTACHMENT_API: string = `https://9gakp3em77.${BASEPATH}/order/service/failure/attachment`;
    public static EXTENDED_SEARCH_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order/search`;

    // order-search.service.ts
    public static GET_ORDER_STATUS_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order/status?orderid=`; //${orderID}


    //origin-destinatin-freight.service.ts
    public static GET_SHIPPER_AIRPORT_CODE_API: string =  `https://hsge8o181c.${BASEPATH}/accounts/airportcodes?zip_code=`; //${zipCode}
    public static CREATE_DIAMENSION_API: string = `https://u61vfdbw9i.${BASEPATH}/freight/orders/dimensions`;
    public static GET_DIAMENSIONS_API: string = `https://u61vfdbw9i.${BASEPATH}/freight/orders/dimensions?bookingid=`; //${bookingID}
    public static GET_SPECIAL_CHARGES_API: string = `https://wz6thz3au7.${BASEPATH}/specialcharges`;   //${bookingID}/${selectedTypeId}?zone=${zone}&sourceKey=${sourceKey}
    public static UPDATE_WEIGHT_DIAMENSION_API: string = `https://5zbt2n8i3j.${BASEPATH}/customer/order/dimension`;


    //utilities.service.ts
    public static GET_PICKUP_DELIVERY_AGENTS_API: string = `${UTILITIES_PATH}/pickup-delivery-agents?airport_code=`;//${AIRPORT_CODE}&tsa_approved=${tsaApproved}
    public static GET_COMPANY_LOCATIONS_API: string =`${UTILITIES_PATH}/companylocations`;
    public static GET_KSMS_CATEGORIES_API: string = `${UTILITIES_PATH}/ksmscategories`;
    public static GET_SHOW_CODES_API: string = `${UTILITIES_PATH}/shows`;
    public static GET_TIME_CODES_API: string = `${UTILITIES_PATH}/timecodes`;
    public static GET_SERVICE_LEVELS_API: string = `${UTILITIES_PATH}/servicelevels/?tariff_id=`;
    public static GET_ALERT_TYPES_API: string = `${UTILITIES_PATH}/alert-types`;    //${tariffID}
    public static GET_NOTIFICATION_MAPPING_API: string = `${UTILITIES_PATH}/notification-mapping`;
    public static GET_ROUTING_STATUS_OPTIONS_API: string = `${UTILITIES_PATH}/routing-status`;
    public static GET_FIELD_REPRESENTATIVES_API: string = `${UTILITIES_PATH}/field-representatives`;
    public static GET_CARRIER_CODES_API: string = `${UTILITIES_PATH}/carriers`;
    public static GET_CARRIER_SERVICE_LEVELS_API: string = `${UTILITIES_PATH}/carrierservicelevels?tariff_id=`; //${tariff_ID}
    public static GET_DIVISION_DATA_API: string = `${UTILITIES_PATH}/divisions`;
    public static GET_STATUS_CODES_API: string = `${UTILITIES_PATH}/statuscodes`;


}