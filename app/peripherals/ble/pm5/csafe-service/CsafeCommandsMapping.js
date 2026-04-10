/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  based on version 08-08-2023 of the C2 Bluetooth specification, see https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
*/

/**
 * @readonly
 * @enum {number}
 */
/* eslint-disable max-lines -- Concept 2 uses a lot of enums, not much we can do about them */
export const UniqueFrameFlags = {
  ExtendedStartFlag: 0xF0,
  StandardStartFlag: 0xF1,
  StopFlag: 0xF2,
  StuffFlag: 0xF3
}

/**
 * @readonly
 * @enum {number}
 */
export const PreviousFrameStatus = {
  Ok: 0x00,
  Reject: 0x10,
  Bad: 0x20,
  NotReady: 0x30
}

/**
 * @readonly
 * @enum {number}
 */
export const StateMachineState = {
  Error: 0x00,
  Ready: 0x01,
  Idle: 0x02,
  HaveId: 0x03,
  InUse: 0x05,
  Pause: 0x06,
  Finish: 0x07,
  Manual: 0x08,
  OffLine: 0x09
}

export const WorkoutState = {
  WORKOUTSTATE_WAITTOBEGIN: 0,
  WORKOUTSTATE_WORKOUTROW: 1,
  WORKOUTSTATE_COUNTDOWNPAUSE: 2,
  WORKOUTSTATE_INTERVALREST: 3,
  WORKOUTSTATE_INTERVALWORKTIME: 4,
  WORKOUTSTATE_INTERVALWORKDISTANCE: 5,
  WORKOUTSTATE_INTERVALRESTENDTOWORKTIME: 6,
  WORKOUTSTATE_INTERVALRESTENDTOWORKDISTANCE: 7,
  WORKOUTSTATE_INTERVALWORKTIMETOREST: 8,
  WORKOUTSTATE_INTERVALWORKDISTANCETOREST: 9,
  WORKOUTSTATE_WORKOUTEND: 10,
  WORKOUTSTATE_TERMINATE: 11,
  WORKOUTSTATE_WORKOUTLOGGED: 12,
  WORKOUTSTATE_REARM: 13
}

export const RowingState = {
  ROWINGSTATE_INACTIVE: 0,
  ROWINGSTATE_ACTIVE: 1
}

export const StrokeState = {
  STROKESTATE_WAITING_FOR_WHEEL_TO_REACH_MIN_SPEED_STATE: 0,
  STROKESTATE_WAITING_FOR_WHEEL_TO_ACCELERATE_STATE: 1,
  STROKESTATE_DRIVING_STATE: 2,
  STROKESTATE_DWELLING_AFTER_DRIVE_STATE: 3,
  STROKESTATE_RECOVERY_STATE: 4
}

export const DurationTypes = {
  CSAFE_TIME_DURATION: 0,
  CSAFE_CALORIES_DURATION: 0X40,
  CSAFE_DISTANCE_DURATION: 0X80,
  CSAFE_WATTS_DURATION: 0XC0
}

/**
 * @readonly
 * @enum {number}
 */
export const ErgModelType = {
  /** Model D/E type (0). */
  ERGMODEL_TYPE_D: 0x00,
  /** Model C/B type (1). */
  ERGMODEL_TYPE_C: 0x01,
  /** Model A type (2). */
  ERGMODEL_TYPE_A: 0x02

}

/**
 * @readonly
 * @enum {number}
 */
export const PublicShortCommands = {
  CSAFE_GETSTATUS_CMD: 0x80,
  CSAFE_RESET_CMD: 0x81,
  CSAFE_GOIDLE_CMD: 0x82,
  CSAFE_GOHAVEID_CMD: 0x83,
  CSAFE_GOINUSE_CMD: 0x85,
  CSAFE_GOFINISHED_CMD: 0x86,
  CSAFE_GOREADY_CMD: 0x87,
  CSAFE_BADID_CMD: 0x88,
  CSAFE_GETVERSION_CMD: 0x91,
  CSAFE_GETID_CMD: 0x92,
  CSAFE_GETUNITS_CMD: 0x93,
  CSAFE_GETSERIAL_CMD: 0x94,
  CSAFE_GETLIST_CMD: 0x98,
  CSAFE_GETUTILIZATION_CMD: 0x99,
  CSAFE_GETMOTORCURRENT_CMD: 0x9A,
  CSAFE_GETODOMETER_CMD: 0x9B,
  CSAFE_GETERRORCODE_CMD: 0x9C,
  CSAFE_GETSERVICECODE_CMD: 0x9D,
  CSAFE_GETUSERCFG1_CMD: 0x9E,
  CSAFE_GETUSERCFG2_CMD: 0x9F,
  CSAFE_GETTWORK_CMD: 0xA0,
  CSAFE_GETHORIZONTAL_CMD: 0xA1,
  CSAFE_GETVERTICAL_CMD: 0xA2,
  CSAFE_GETCALORIES_CMD: 0xA3,
  CSAFE_GETPROGRAM_CMD: 0xA4,
  CSAFE_GETSPEED_CMD: 0xA5,
  CSAFE_GETPACE_CMD: 0xA6,
  CSAFE_GETCADENCE_CMD: 0xA7,
  CSAFE_GETGRADE_CMD: 0xA8,
  CSAFE_GETGEAR_CMD: 0xA9,
  CSAFE_GETUPLIST_CMD: 0xAA,
  CSAFE_GETUSERINFO_CMD: 0xAB,
  CSAFE_GETTORQUE_CMD: 0xAC,
  CSAFE_GETHRCUR_CMD: 0xB0,
  CSAFE_GETHRTZONE_CMD: 0xB2,
  CSAFE_GETMETS_CMD: 0xB3,
  CSAFE_GETPOWER_CMD: 0xB4,
  CSAFE_GETHRAVG_CMD: 0xB5,
  CSAFE_GETHRMAX_CMD: 0xB6,
  CSAFE_GETUSERDATA1_CMD: 0xBE,
  CSAFE_GETUSERDATA2_CMD: 0xBF,
  CSAFE_GETAUDIOCHANNEL_CMD: 0xC0,
  CSAFE_GETAUDIOVOLUME_CMD: 0xC1,
  CSAFE_GETAUDIOMUTE_CMD: 0xC2,
  CSAFE_ENDTEXT_CMD: 0xE0,
  CSAFE_DISPLAYPOPUP_CMD: 0xE1,
  CSAFE_GETPOPUPSTATUS_CMD: 0xE5
}

/**
 * @readonly
 * @enum {number}
 */
export const PublicLongCommands = {
  /** [Configuration]  - Response: N/A */
  CSAFE_AUTOUPLOAD_CMD2: 0x01,
  /** <Not implemented> - Response: N/A */
  // CSAFE_UPLIST_CMD: 0x02
  /** <Not implemented> - Response: N/A */
  CSAFE_UPSTATUSSEC_CMD: 0x04,
  /** <Not implemented> - Response: N/A */
  // CSAFE_UPLISTSEC_CMD: 0x05
  /** [# of Digits] - Response: N/A */
  CSAFE_IDDIGITS_CMD: 0x10,
  /** [Hour, Minute, Second] - Response: N/A */
  CSAFE_SETTIME_CMD: 0x11,
  /** [Year, Month, Day] - Response: N/A */
  CSAFE_SETDATE_CMD: 0x12,
  /** [State Timeout] - Response N/A */
  CSAFE_SETTIMEOUT_CMD: 0x13,
  /** Same as the proprietary wrapper [...One or more PMspecific commands] - Response PM specific */
  CSAFE_SETUSERCFG1_CMD1: 0x1A,
  /** <Not implemented> - Response */
  // CSAFE_SETUSERCFG2_CMD: 0x1B,
  /** [Distance (LSB), Horizontal Distance (MSB), Units Specifier] - Response N/A */
  CSAFE_SETHORIZONTAL_CMD: 0x21,
  /** <Not implemented> - Response: N/A */
  // CSAFE_SETVERTICAL_CMD: 0x22
  /** [Total Calories (LSB), Total Calories (MSB)] - Response N/A */
  CSAFE_SETCALORIES_CMD: 0x23,
  /** [Programmed  or Pre-stored  Workout, <don't care>] - Response N/A */
  CSAFE_SETPROGRAM_CMD: 0x24,
  /** <Not implemented> - Response */
  // CSAFE_SETSPEED_CMD: 0x25,
  /** <Not implemented> - Response */
  // CSAFE_SETGRADE_CMD: 0x28,
  /** <Not implemented> - Response */
  // CSAFE_SETGEAR_CMD: 0x29,
  /** <Not implemented> - Response */
  // CSAFE_SETUSERINFO_CMD: 0x2B,
  /** <Not implemented> - Response */
  // CSAFE_SETTORQUE_CMD: 0x2C,
  /** <Not implemented> - Response */
  // CSAFE_SETLEVEL_CMD: 0x2D,
  /** <Not implemented> - Response */
  // CSAFE_SETTARGETHR_CMD: 0x30,
  /** <Not implemented> - Response */
  // CSAFE_SETMETS_CMD: 0x33,
  /** [Stroke Watts (LSB), Stroke Watts (MSB), Units Specifier] - Response N/A */
  CSAFE_SETPOWER_CMD: 0x34,
  /** <Not implemented> - Response */
  // CSAFE_SETHRZONE_CMD: 0x35,
  /** <Not implemented> - Response */
  // CSAFE_SETHRMAX_CMD: 0x36,
  /** <Not implemented> - Response */
  // CSAFE_SETCHANNELRANGE_CMD: 0x40,
  /** <Not implemented> - Response */
  // CSAFE_SETVOLUMERANGE_CMD: 0x41,
  /** <Not implemented> - Response */
  // CSAFE_SETAUDIOMUTE_CMD: 0x42,
  /** <Not implemented> - Response */
  // CSAFE_SETAUDIOCHANNEL_CMD: 0x43,
  /** <Not implemented> - Response */
  // CSAFE_SETAUDIOVOLUME_CMD: 0x44,
  /** <Not implemented> - Response */
  // CSAFE_STARTTEXT_CMD: 0x60,
  /** <Not implemented> - Response */
  // CSAFE_APPENDTEXT_CMD: 0x61,
  /** <Not implemented> - Response */
  // CSAFE_GETTEXTSTATUS_CMD: 0x65,
  /** [Capability Code] - Response [Capability Code 0x00: [Max Rx Frame, Max Tx Frame, Min Interframe]; Capability Code 0x01:[0x00, 0x00]; Capability Code 0x02: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] ] */
  CSAFE_GETCAPS_CMD: 0x70,
  /**
   * Assumes Proprietary set Config (short/long) commands as data (e.g. set Date and Time)
   */
  CSAFE_SETPMCFG_CMD: 0x76,
  /**
   * Assumes Proprietary set Data (short/long) commands as data (e.g. set Extended HR belt)
   */
  CSAFE_SETPMDATA_CMD: 0x77,
  /**
   * Assumes Proprietary Get Config (short/long) commands as data (e.g. get Date and Time)
   */
  CSAFE_GETPMCFG_CMD: 0x7E,
  /**
   * Assumes Proprietary Get Data (short/long) commands as data (e.g. get Extended HR belt)
   */
  CSAFE_GETPMDATA_CMD: 0x7F
}

/**
 * @readonly
 * @enum {number}
 */
export const ProprietaryLongSetConfigCommands = {
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_BAUDRATE: 0x00,
  /** [Workout Type] - Response N/A */
  CSAFE_PM_SET_WORKOUTTYPE: 0x01,
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_STARTTYPE: 0x02,
  /** [Time/Distance duration (0: Time, 0x40: Calories, 0x60: Watt-Min, 0x80: Distance), Duration (MSB), Duration, Duration, Duration (LSB)] - Response N/A */
  CSAFE_PM_SET_WORKOUTDURATION: 0x03,
  /** [Duration (MSB), Duration (LSB)] - Response N/A */
  CSAFE_PM_SET_RESTDURATION: 0x04,
  /** [Time/Distance duration (0: Time, 0x40: Calories, 0xC0: Watt-Min, 0x80: Distance), Duration (MSB), Duration, Duration Duration (LSB)] - Response N/A */
  CSAFE_PM_SET_SPLITDURATION: 0x05,
  /** [Pace Time (MSB), Pace Time, Pace Time, Pace Time (LSB)] - Response N/A */
  CSAFE_PM_SET_TARGETPACETIME: 0x06,
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_INTERVALIDENTIFIER: 0x07
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_OPERATIONALSTATE: 0x08
  /** [Type] - Response N/A */
  CSAFE_PM_SET_RACETYPE: 0x09,
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_WARMUPDURATION: 0x0A
  /** [Erg Physical Address, Race Lane Number] - Response N/A */
  CSAFE_PM_SET_RACELANESETUP: 0x0B,
  /** [Erg Physical Address, Race Lane Number] - Response N/A */
  CSAFE_PM_SET_RACELANEVERIFY: 0x0C,
  /** [Start Type (0: Random, 1: Countdown, 2: Random modified), Count Start Count/Race Start State, Ready Tick Count (MSB), Ready Tick Count Ready Tick Count Ready Tick Count (LSB), Attention Tick Count/Countdown Ticks Per, Number (MSB), Attention Tick Count/Countdown Ticks Per, Number, Attention Tick Count/Countdown Ticks Per, Number, Attention Tick Count/Countdown Ticks Per, Number (LSB), Row Tick Count (MSB), Row Tick Count Row Tick Count Row Tick Count (LSB)] - Response N/A */
  CSAFE_PM_SET_RACESTARTPARAMS: 0x0D,
  /** [Starting Erg Slave Address] - Response N/A */
  CSAFE_PM_SET_ERGSLAVEDISCOVYREQUEST: 0x0E,
  /** [Boat] - Response N/A */
  CSAFE_PM_SET_BOATNUMBER: 0x0F,
  /** [HW address (MSB), HW address, HW address, HW address (LSB), Erg Number (Logical Address)] - Response N/A */
  CSAFE_PM_SET_ERGNUMBER: 0x10,
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_COMMUNICATIONSTA: 0x11,
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_CMDUPLIST: 0x12
  /** [Screen Type, Screen Value] - Response N/A */
  CSAFE_PM_SET_SCREENSTATE: 0x13,
  /** [Programming mode (0: Disable, 1: Enable)] - Response N/A */
  CSAFE_PM_CONFIGURE_WORKOUT: 0x14,
  /** [Avg Watts (MSB), Avg Watts (LSB)] - Response N/A */
  CSAFE_PM_SET_TARGETAVGWATTS: 0x15,
  /** [Cals/Hr (MSB), Cals/Hr (LSB)] - Response N/A */
  CSAFE_PM_SET_TARGETCALSPERHR: 0x16,
  /** [Interval Type   (0: Time, 1: Distance, 2:  Rest, 3:Time w/ Undefined  Rest 4: Distance w/  Undefined Rest, 5:
  Undefined Rest, 6: Calorie,  7: Calorie w/ Undefined  Rest, 8: WattMinute, 9:  WattMinute w/ Undefined
  Rest)] - Response N/A */
  CSAFE_PM_SET_INTERVALTYPE: 0x17,
  /** [Interval Count] - Response N/A */
  CSAFE_PM_SET_WORKOUTINTERVALCOUNT: 0x18,
  /** [Display Update Rate] - Response N/A */
  CSAFE_PM_SET_DISPLAYUPDATERATE: 0x19,
  /** [HW address (MSB),  HW address,  HW address,  HW address (LSB),  Authen PW (MSB),  Authen PW,  Authen PW,  Authen PW,  Authen PW,  Authen PW,  Authen PW,  Authen PW (LSB)] - Response [Result] */
  CSAFE_PM_SET_AUTHENPASSWORD: 0x1A,
  /** [Tick Time (MSB), Tick Time, Tick Time, Tick Time (LSB)] - Response  N/A */
  CSAFE_PM_SET_TICKTIME: 0x1B,
  /** [Tick Time Offset (MSB), Tick Time Offset, Tick Time Offset, Tick Time Offset (LSB)] - Response N/A */
  CSAFE_PM_SET_TICKTIMEOFFSET: 0x1C,
  /** [Sample Tick (MSB), Sample Tick, Sample Tick, Sample Tick (LSB)] - Response N/A */
  CSAFE_PM_SET_RACEDATASAMPLETICKS: 0x1D,
  /** [Type] - Response N/A */
  CSAFE_PM_SET_RACEOPERATIONTYP: 0x1E,
  /** [Display Tick (MSB), Display Tick, Display Tick, Display Tick (LSB)] - Response N/A */
  CSAFE_PM_SET_RACESTATUSDISPLA: 0x1F,
  /** [Warning Tick (MSB), Warning Tick, Warning Tick, Warning Tick (LSB)] - Response N/A */
  CSAFE_PM_SET_RACESTATUSWARNIN: 0x20,
  /** [Doze Sec (MSB), Doze Sec (LSB), Sleep Sec (MSB), Sleep Sec (LSB), Unused, Unused, Unused, Unused] - Response N/A */
  CSAFE_PM_SET_RACEIDLEMODEPARA: 0x21,
  /** [Time Hours (1 - 12), Time Minutes (0 - 59), Time Meridiem (0 = AM, 1 = PM), Date Month (1 - 12), Date Day (1 - 31), Date Year (MSB), Date Year (LSB)] - Response N/A */
  CSAFE_PM_SET_DATETIME: 0x22,
  /** [Language Type] - Response N/A */
  CSAFE_PM_SET_LANGUAGETYPE: 0x23,
  /** [Config Index, WEP Mode] - Response N/A */
  CSAFE_PM_SET_WIFICONFIG: 0x24,
  /** [CPU/Tick Rate] - Response N/A */
  CSAFE_PM_SET_CPUTICKRATE: 0x25,
  /** [Logcard User] - Response N/A */
  CSAFE_PM_SET_LOGCARDUSER: 0x26,
  /** [Mode (disable/enable)] - Response N/A */
  CSAFE_PM_SET_SCREENERRORMODE: 0x27,
  /** [Dummy Data (..., Dummy Data (- Response N/A */
  CSAFE_PM_SET_CABLETEST3: 0x28,
  /** [User Number, User ID (MSB), User ID, User ID, User ID (LSB)] - Response N/A */
  CSAFE_PM_SET_USER_ID: 0x29,
  /** [User Number, User Weight (MSB), User Weight (LSB), User DOB Day, User DOB Month, User DOB Year (MSB), User DOB Year (LSB), User Gender] - Response N/A */
  CSAFE_PM_SET_USER_PROFILE: 0x2A,
  /** [Device Manufacture ID, Device Type, Device Num (MSB), Device Num (LSB)] - Response N/A */
  CSAFE_PM_SET_HRM: 0x2B,
  /** [Physical Address of First Erg In Race] - Response N/A */
  CSAFE_PM_SET_RACESTARTINGPHYSCALADDRESS: 0x2C,
  /** [User Number, Mfg ID, Device Type, Belt ID (MSB), Belt ID (LSB)] - Response N/A */
  CSAFE_PM_SET_HRBELT_INFO: 0x2D,
  /** [RF Frequency, RF Period Hz (MSB), RF Period Hz (LSB), Datapage Pattern, Activity Timeout] - Response N/A */
  CSAFE_PM_SET_SENSOR_CHANNEL: 0x2F
}

/**
 * @readonly
 * @enum {number}
 */
export const ProprietaryLongSetDataCommands = {
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_TEAM_DISTANCE: 0x30,
  /** <Not implemented> - Response */
  // CSAFE_PM_SET_TEAM_FINISH_TIME: 0x31,
  /** [Racer ID (Erg physical address), Racer Name (MSB), Racer Name, ..., Racer Name (LSB - - Response N/A */
  CSAFE_PM_SET_RACEPARTICIPANT: 0x32,
  /** [First Racer ID, First Racer Position, First Racer Delta Distance/Time (MSB), ..., First Racer Delta Distance/Time (LSB - ..., Forth Racer ID, Forth Racer Position, Forth Racer Delta Distance/Time (MSB), ..., Forth Racer Delta Distance/Time (LSB - Team Distance (MSB - ..., Team Distance (LSB -  Mode] - Response N/A */
  CSAFE_PM_SET_RACESTATUS: 0x33,
  /** [Start address (MSB), Start address, Start address, ..., 64nd data to be set] - Response [Bytes written] */
  CSAFE_PM_SET_LOGCARD_MEMORY1: 0x34,
  /** [1st Character, 2nd Character, ..., 32nd character] - Response N/A */
  CSAFE_PM_SET_DISPLAYSTRING: 0x35,
  /** [Bitmap index (MSB), Bitmap index (LSB), Block length, ..., Data Index + 63] - Response [Total bitmap bytes (MSB), Total bitmap bytes (LSB)] */
  CSAFE_PM_SET_DISPLAYBITMAP: 0x36,
  /** [Race Type, Race Length (MSB), Race Length, ..., Race Length (LSB - Race Participants, Race State, Race Lane] - Response N/A */
  CSAFE_PM_SET_LOCALRACEPARTICIPANT: 0x37,
  /** [Game Type ID , Workout Duration Time (MSB), Workout Duration Time, Workout Duration Time, Workout Duration Time (LSB), Split Duration Time (MSB), Split Duration Time , Split Duration Time , Split Duration Time (LSB), Target Pace Time (MSB), Target Pace Time , Target Pace Time , Target Pace Time (LSB), Target Avg Watts (MSB), Target Avg Watts , Target Avg Watts , Target Avg Watts (LSB), Target Cals Per Hour (MSB), Target Cals Per Hour, Target Cals Per Hour, Target Cals Per Hour (LSB), Target Stroke Rate ] - Response N/A */
  CSAFE_PM_SET_GAMEPARAMS: 0x38,
  /** [unused, HRM mfg id, HRM device type, HRM belt id (MSB), HRM belt id, HRM belt id, HRM belt id (LSB)] - Response N/A */
  CSAFE_PM_SET_EXTENDED_HRBELT_INFO: 0x39,
  /** [HRM mfg id, HRM device type, HRM belt id (MSB), HRM belt id, HRM belt id, HRM belt id (LSB)] - Response N/A */
  CSAFE_PM_SET_EXTENDED_HRM: 0x3A,
  /** [State (enable/disable), Intensity (0 - 100%)] - Response N/A */
  CSAFE_PM_SET_LEDBACKLIGHT: 0x3B,
  /** [Record Type (Enum), Record Index (MSB), Record Index (LSB) (65535 archives all)] - Response N/A */
  CSAFE_PM_SET_DIAGLOG_RECORD_ARCHIVE: 0x3C,
  /** [Wireless channel bit mask (MSB), Wireless channel bit mask, Wireless channel bit mask, Wireless channel bit mask (LSB)] - Response N/A */
  CSAFE_PM_SET_WIRELESS_CHANNEL: 0x3D,
  /** [Undefined rest to work transition time, 1sec LSB (MSB), Undefined rest to work transition time (LSB), Undefined rest interval, 1sec LSB (MSB), Undefined rest interval, (LSB), Race prompt bitmap display duration, 1sec LSB (MSB), Race prompt bitmap display duration, Race prompt bitmap display duration, Race prompt bitmap display duration (LSB), Time Cap duration, 1 sec LSB (MSB), Time Cap duration, Time Cap duration, Time Cap duration (LSB)] - Response N/A */
  CSAFE_PM_SET_RACECONTROLPARMS: 0x3E
}

/**
 * @readonly
 * @enum {number}
 */
export const ProprietaryLongGetDataCommands = {
  /** [Device type (0: ESRAM, 1: Ext SRAM, 2: FLASH), Start address (MSB), Start address, Start address, Start address (LSB), Block length] - Response [Bytes read, 1st data read, 2nd data read, ...,  64nd data read] */
  CSAFE_PM_GET_MEMORY: 0x68,
  /** [Start address (MSB), Start address, Start address, Start address (LSB), Block length] - Response [Bytes read, 1st data read, 2nd data read, ...,  64nd data read] */
  CSAFE_PM_GET_LOGCARD_MEMORY: 0x69,
  /** [Start address (MSB), Start address, Start address, Start address (LSB), Block length] - Response [Bytes read, 1st data read, 2nd data read, ...,  64nd data read] */
  CSAFE_PM_GET_INTERNALLOGMEMORY: 0x6A,
  /** [Block length] - Response [Bytes read, 1st data read (MSB), 1st data read (LSB), 2nd data read (MSB), ...,  16th data read (LSB)] */
  CSAFE_PM_GET_FORCEPLOTDATA: 0x6B,
  /** [Block length in bytes] - Response [Bytes read, 1st data read (LSB), 1st data read (MSB), 2nd data read (LSB), ...,  16th data read (MSB)] */
  CSAFE_PM_GET_HEARTBEATDATA: 0x6C,
  /** [0 (unused)] - Response [User I/F Events (MSB), User I/F Events (LSB)] */
  CSAFE_PM_GET_UI_EVENTS: 0x6D,
  /** [0 (unused)] - Response [Stroke Distance (MSB), Stroke Distance (LSB), Stroke Drive Time, Stroke Recovery Time (MSB), Stroke Recovery Time (LSB), Stroke Length, Drive Counter (MSB), Drive Counter (LSB), Peak Drive Force (MSB), Peak Drive Force (LSB),  Impulse Drive Force (MSB),  Impulse Drive Force (LSB),  Avg Drive Force (MSB),  Avg Drive Force (LSB),  Work Per Stroke (MSB),  Work Per Stroke (LSB)] */
  CSAFE_PM_GET_STROKESTATS: 0x6E,
  /** [Record Type (Enum)] - Response [Record Type (Enum), Record Num (MSB), Record Num (LSB)] */
  CSAFE_PM_GET_DIAGLOG_RECORD_NUM: 0x70,
  /** [Record Type (Enum), Record Index (MSB), Record Index (LSB), Record Offset Bytes (MSB), Record Offset Bytes (LSB)] - Response [Record Index (MSB), Record Index (LSB), Valid Record Bytes (MSB), Valid Record Bytes (LSB), 1st data read, 2nd data read, ...,  68nd data read] */
  CSAFE_PM_GET_DIAGLOG_RECORD: 0x71,
  /** [0 (unused)] - Response [Hash (MSB), Hash, Hash, Hash, Hash, Hash, Hash, Hash (LSB), 0 (unused), 0 (unused), ...,  0 (unused)] */
  CSAFE_PM_GET_CURRENT_WORKOUT: 0x72,
  /** Internal Use */
  // CSAFE_PM_GET_GAME_SCORE: 0x78,
  /** [0 (unused)] - Response [Game ID enumeration, Game Score (MSB) (Fish/Darts 1 point LSB, Target 0.1% LSB), Game Score (LSB)] */
  CSAFE_PM_GET_GAME_SCORE: 0x78
}

/**
 * @readonly
 * @enum {number}
 */export const ProprietaryLongGetConfigCommands = {
  /** [HW address1 (MSB), HW address, HW address, HW address (LSB)] - Response [Erg #] */
  CSAFE_PM_GET_ERG_NUMBER: 0x50,
  /** [Logical Erg Number Requested, Physical Erg Number Requested, HW address, HW address, HW address (LSB)] - Response [Logical Erg #, HW address1 (MSB), HW address, HW address, HW address (LSB), Physical Erg #] */
  CSAFE_PM_GET_ERGNUMBERREQUEST: 0x51,
  /** [User Number] - Response [User ID (MSB), User ID, User ID, ..., User ID (LSB)] */
  CSAFE_PM_GET_USERIDSTRING: 0x52,
  /** [Race Type, Race Length (MSB), Race Length, Race Length, Race Length (LSB), Race Participants, Race State] - Response [HW address (MSB), HW address, HW address, HW address (LSB), UserID String (MSB), UserID String, ..., UserID String (LSB), Machine type] */
  CSAFE_PM_GET_LOCALRACEPARTICIPANT: 0x53,
  /** [User Number] - Response [User Number, User ID (MSB), User ID, User ID, User ID (LSB)] */
  CSAFE_PM_GET_USER_ID: 0x54,
  /** [User Number] - Response [User Number, User Weight (MSB), User Weight (LSB), User DOB Day, User DOB Month, User DOB Year (MSB), User DOB Year (LSB), User Gender] */
  CSAFE_PM_GET_USER_PROFILE: 0x55,
  /** [User Number] - Response [User Number, Mfg ID, Device Type, Belt ID (MSB), Belt ID (LSB)] */
  CSAFE_PM_GET_HRBELT_INFO: 0x56,
  /** [User Number] - Response [User Number, Mfg ID, Device Type, Belt ID (MSB), Belt ID, Belt ID, Belt ID (LSB)] */
  CSAFE_PM_GET_EXTENDED_HRBELT_INFO: 0x57,
  /** [Structure ID enumeration, Split/interval number (1 - M), Bytes read, 1st data read, 2nd data read, ...,  2: Nth data read] - Response [Structure ID enumeration, Split/interval number, Bytes read, 1st data read, 2nd data read, ...,  2: Nth data read] */
  CSAFE_PM_GET_CURRENT_LOG_STRUCTURE: 0x58
}

/**
 * @readonly
 * @enum {number}
 */
export const ProprietaryShortGetDataCommands = {
  /** [Work Time (MSB), Work Time, Work Time, Work Time (LSB)] */
  CSAFE_PM_GET_WORKTIME: 0xA0,
  /** [Projected Work Time (MSB), Projected Work Time, Projected Work Time, Projected Work Time (LSB)] */
  CSAFE_PM_GET_PROJECTED_WORKTIME: 0xA1,
  /** [Total Rest Time (MSB), Total Rest Time, Total Rest Time, Total Rest Time (LSB)] */
  CSAFE_PM_GET_TOTAL_RESTTIME: 0xA2,
  /** [Work Distance (MSB), Work Distance, Work Distance, Work Distance (LSB)] */
  CSAFE_PM_GET_WORKDISTANCE: 0xA3,
  /** [Total Work Distance (MSB), Total Work Distance, Total Work Distance, Total Work Distance (LSB)] */
  CSAFE_PM_GET_TOTAL_WORKDISTANCE: 0xA4,
  /** [Projected Work Distance (MSB), Projected Work Distance, Projected Work Distance, Projected Work Distance (LSB)] */
  CSAFE_PM_GET_PROJECTED_WORKDISTANCE: 0xA5,
  /** [Rest Distance (MSB), Rest Distance (LSB)] */
  CSAFE_PM_GET_RESTDISTANCE: 0xA6,
  /** [Total Rest Distance (MSB), Total Rest Distance, Total Rest Distance, Total Rest Distance (LSB)] */
  CSAFE_PM_GET_TOTAL_RESTDISTANCE: 0xA7,
  /** [Pace / 500m (MSB), Pace / 500m, Pace / 500m, Pace / 500m (LSB)] */
  CSAFE_PM_GET_STROKE_500M_PACE: 0xA8,
  /** [Stroke Watts (MSB), Stroke Watts, Stroke Watts, Stroke Watts (LSB)] */
  CSAFE_PM_GET_STROKE_POWER: 0xA9,
  /** [Stroke Cals/Hr (MSB), Stroke Cals/Hr, Stroke Cals/Hr, Stroke Cals/Hr (LSB)] */
  CSAFE_PM_GET_STROKE_CALORICBURNRATE: 0xAA,
  /** [Split Avg Pace / 500m (MSB), Split Avg Pace / 500m, Split Avg Pace / 500m, Split Avg Pace / 500m (LSB)] */
  CSAFE_PM_GET_SPLIT_AVG_500M_PACE: 0xAB,
  /** [Split Avg Watts (MSB), Split Avg Watts, Split Avg Watts, Split Avg Watts (LSB)] */
  CSAFE_PM_GET_SPLIT_AVG_POWER: 0xAC,
  /** [Split Avg Cals/Hr (MSB), Split Avg Cals/Hr, Split Avg Cals/Hr, Split Avg Cals/Hr (LSB)] */
  CSAFE_PM_GET_SPLIT_AVG_CALORICBURNRATE: 0xAD,
  /** [Split Avg Cals (MSB), Split Avg Cals, Split Avg Cals, Split Avg Cals (LSB)] */
  CSAFE_PM_GET_SPLIT_AVG_CALORIES: 0xAE,
  /** [Total Avg Pace / 500m (MSB), Total Avg Pace / 500m, Total Avg Pace / 500m, Total Avg Pace / 500m (LSB)] */
  CSAFE_PM_GET_TOTAL_AVG_500MPACE: 0xAF,
  /** [Total Avg Watts (MSB), Total Avg Watts, Total Avg Watts, Total Avg Watts (LSB)] */
  CSAFE_PM_GET_TOTAL_AVG_POWER: 0xB0,
  /** [Total Avg Cals/Hr (MSB), Total Avg Cals/Hr, Total Avg Cals/Hr, Total Avg Cals/Hr (LSB)] */
  CSAFE_PM_GET_TOTAL_AVG_CALORICBURNRATE: 0xB1,
  /** [Total Avg Calories (MSB), Total Avg Calories, Total Avg Calories, Total Avg Calories (LSB)] */
  CSAFE_PM_GET_TOTAL_AVG_CALORIES: 0xB2,
  /** [Strokes/Min] */
  CSAFE_PM_GET_STROKE_RATE: 0xB3,
  /** [Split/Interval Avg Strokes/Min] */
  CSAFE_PM_GET_SPLIT_AVG_STROKERATE: 0xB4,
  /** [Total Avg Strokes/Min] */
  CSAFE_PM_GET_TOTAL_AVG_STROKERATE: 0xB5,
  /** [Avg Beats/Min] */
  CSAFE_PM_GET_AVG_HEART_RATE: 0xB6,
  /** [Split/Interval Avg Beats/Min] */
  CSAFE_PM_GET_ENDING_AVG_HEARTRATE: 0xB7,
  /** [Rest Interval Avg Beats/Min] */
  CSAFE_PM_GET_REST_AVG_HEARTRATE: 0xB8,
  /** [Elapsed Time / Split (MSB), Elapsed Time / Split, Elapsed Time / Split, Elapsed Time / Split (LSB)] */
  CSAFE_PM_GET_SPLITTIME: 0xB9,
  /** [Last Elapsed Time / Split (MSB), Last Elapsed Time / Split, Last Elapsed Time / Split, Last Elapsed Time / Split (LSB)] */
  CSAFE_PM_GET_LAST_SPLITTIME: 0xBA,
  /** [Work Distance/Split (MSB), Work Distance/Split, Work Distance/Split, Work Distance/Split (LSB)] */
  CSAFE_PM_GET_SPLITDISTANCE: 0xBB,
  /** [Last Work Distance/Split (MSB), Last Work Distance/Split, Last Work Distance/Split, Last Work Distance/Split (LSB)] */
  CSAFE_PM_GET_LAST_SPLITDISTANCE: 0xBC,
  /** [Last Rest Interval Distance (MSB), Last Rest Interval Distance, Last Rest Interval Distance, Last Rest Interval Distance (LSB)] */
  CSAFE_PM_GET_LAST_RESTDISTANCE: 0xBD,
  /** [Target Pace Time (MSB), Target Pace Time, Target Pace Time, Target Pace Time (LSB)] */
  CSAFE_PM_GET_TARGETPACETIME: 0xBE,
  /** [Stroke State] */
  CSAFE_PM_GET_STROKESTATE: 0xBF,
  /** [Stroke Rate State] */
  CSAFE_PM_GET_STROKERATESTATE: 0xC0,
  /** [Drag Factor] */
  CSAFE_PM_GET_DRAGFACTOR: 0xC1,
  /** [Encoder Period (Float MSB), Encoder Period, Encoder Period, Encoder Period (Float LSB)] */
  CSAFE_PM_GET_ENCODER_PERIOD: 0xC2,
  /** [Heartrate State] */
  CSAFE_PM_GET_HEARTRATESTATE: 0xC3,
  /** [Sync Data (Float MSB), Sync Data, Sync Data, Sync Data (Float LSB)] */
  CSAFE_PM_GET_SYNC_DATA: 0xC4,
  /** [Work Distance (Float MSB), Work Distance, Work Distance, Work Distance (Float LSB), Work Time (Float MSB), Work Time, Work Time, Work Time (Float LSB), Stroke Pace (Float MSB), Stroke Pace, Stroke Pace, Stroke Pace (Float LSB), Avg Heartrate (Float MSB), Avg Heartrate, Avg Heartrate, Avg Heartrate (Float LSB)] */
  CSAFE_PM_GET_SYNCDATAALL: 0xC5,
  /** [Tick Time Stamp (MSB), Tick Time Stamp, Tick Time Stamp, Tick Time Stamp (LSB), Total Race Meters (MSB), Total Race Meters, Total Race Meters, Total Race Meters (LSB), 500m Pace (MSB), 500m Pace (LSB), Race Elapsed Time (MSB), Race Elapsed Time, Race Elapsed Time, Race Elapsed Time (LSB), Stroke Rate, Race State, Percent Battery Level, Stroke State, Rowing, EPM Status, Race Operation Type, Race Start State] */
  CSAFE_PM_GET_RACE_DATA: 0xC6,
  /** [Tick Time (MSB), Tick Time, Tick Time, Tick Time (LSB)] */
  CSAFE_PM_GET_TICK_TIME: 0xC7,
  /** [Error Type] */
  CSAFE_PM_GET_ERRORTYPE: 0xC8,
  /** [Error Value (MSB), Error Value (LSB)] */
  CSAFE_PM_GET_ERRORVALUE: 0xC9,
  /** [Status Type] */
  CSAFE_PM_GET_STATUSTYPE: 0xCA,
  /** [Status Value] */
  CSAFE_PM_GET_STATUSVALUE: 0xCB,
  /** [EPM Status] */
  CSAFE_PM_GET_EPMSTATUS: 0xCC,
  /** [Display Update Time (MSB), Display Update Time, Display Update Time, Display Update Time (LSB)] */
  CSAFE_PM_GET_DISPLAYUPDATETIME: 0xCD,
  /** [EPM Fractional Time] */
  CSAFE_PM_GET_SYNCFRACTIONALTIME: 0xCE,
  /** [Rest Time (LSB), Rest Time (MSB)] */
  CSAFE_PM_GET_RESTTIME: 0xCF
}

/**
 * @readonly
 * @enum {number}
 */
export const ProprietaryShortGetConfigCommands = {
  /** [FW Exe Version # (MSB), FW Exe Version #, ..., FW Exe Version # (LSB)] */
  CSAFE_PM_GET_FW_VERSION: 0x80,
  /** [HW Version # (MSB), HW Version #, ..., HW Version # (LSB)] */
  CSAFE_PM_GET_HW_VERSION: 0x81,
  /** [HW address (MSB), HW address, HW address, HW address (LSB)] */
  CSAFE_PM_GET_HW_ADDRESS: 0x82,
  /** [Tick timebase (Float MSB), Tick timebase, Tick timebase, Tick timebase (Float LSB)] */
  CSAFE_PM_GET_TICK_TIMEBASE: 0x83,
  /** [(Channel Status, 0 = Inactive, 1 = Discovery, 2 = Paired If paired then:), Device Manufacture ID, Device Type, Device Num (MSB), Device Num (LSB), Else Bytes 1-4: 0] */
  CSAFE_PM_GET_HRM: 0x84,
  /** [Time Hours (1 - 12), Time Minutes (0 - 59), Time Meridiem (0 = AM, 1 = PM), Date Month (1 - 12), Date Day (1 - 31), Date Year (MSB), Date Year (LSB)] */
  CSAFE_PM_GET_DATETIME: 0x85,
  /** [Screen type, Screen value, Screen status] */
  CSAFE_PM_GET_SCREENSTATESTATUS: 0x86,
  /** [Erg Physical Address] */
  CSAFE_PM_GET_RACE_LANE_REQUEST: 0x87,
  /** [Erg Logical Address] */
  CSAFE_PM_GET_RACE_ENTRY_REQUEST: 0x88,
  /** [Workout type] */
  CSAFE_PM_GET_WORKOUTTYPE: 0x89,
  /** [Display type] */
  CSAFE_PM_GET_DISPLAYTYPE: 0x8A,
  /** [Display units] */
  CSAFE_PM_GET_DISPLAYUNITS: 0x8B,
  /** [Language type] */
  CSAFE_PM_GET_LANGUAGETYPE: 0x8C,
  /** [Workout state] */
  CSAFE_PM_GET_WORKOUTSTATE: 0x8D,
  /** [Interval type] */
  CSAFE_PM_GET_INTERVALTYPE: 0x8E,
  /** [Operational state] */
  CSAFE_PM_GET_OPERATIONALSTATE: 0x8F,
  /** [Log card state] */
  CSAFE_PM_GET_LOGCARDSTATE: 0x90,
  /** [Log card status] */
  CSAFE_PM_GET_LOGCARDSTATUS: 0x91,
  /** [Power-up state] */
  CSAFE_PM_GET_POWERUPSTATE: 0x92,
  /** [Rowing state] */
  CSAFE_PM_GET_ROWINGSTATE: 0x93,
  /** [Screen Content Version # (MSB), Screen Content Version #, ..., Screen Content Version # (LSB)] */
  CSAFE_PM_GET_SCREENCONTENT_VERSION: 0x94,
  /** [Communication state] */
  CSAFE_PM_GET_COMMUNICATIONSTATE: 0x95,
  /** [Race Participant Count] */
  CSAFE_PM_GET_RACEPARTICIPANTCOUNT: 0x96,
  /** [Battery Level Percent] */
  CSAFE_PM_GET_BATTERYLEVELPERCENT: 0x97,
  /** [HW address (MSB), HW address, ..., Operational State] */
  CSAFE_PM_GET_RACEMODESTATUS: 0x98,
  /** [Log Start Address (MSB), Log Start Address, ..., Last Log Entry Length (LSB)] */
  CSAFE_PM_GET_INTERNALLOGPARAMS: 0x99,
  /** [PM Base HW Revision (MSB), PM Base HW Revision (LSB), ..., Unused (0)] */
  CSAFE_PM_GET_PRODUCTCONFIGURATION: 0x9A,
  /** [Status, # of Erg slaves present] */
  CSAFE_PM_GET_ERGSLAVEDISCOVERREQUESTSTATUS: 0x9B,
  /** [Configuration Index, WEP Mode] */
  CSAFE_PM_GET_WIFICONFIG: 0x9C,
  /** [CPU/Tick Rate Enumeration] */
  CSAFE_PM_GET_CPUTICKRATE: 0x9D,
  /** [Number Users on Card, Number of Current User] */
  CSAFE_PM_GET_LOGCARDUSERCENSUS: 0x9E,
  /** [Workout Interval Count] */
  CSAFE_PM_GET_WORKOUTINTERVALCOUNT: 0x9F,
  /** [Time/Distance duration (0: Time, 0x40: Calories, 0xC0: Watt-Min, 0x80: Distance), Duration (MSB), Duration, Duration, Duration (LSB)] */
  CSAFE_PM_GET_WORKOUTDURATION: 0xE8,
  /** [Work Other (MSB), Work Other, Work Other, Work Other (LSB)] */
  CSAFE_PM_GET_WORKOTHER: 0xE9,
  /** [HRM Channel Status, HRM manufacturer ID, HRM device type, HRM device number (MSB), HRM device number, HRM device number, HRM device number (LSB)] */
  CSAFE_PM_GET_EXTENDED_HRM: 0xEA,
  /** [DF Calibration Verified Status] */
  CSAFE_PM_GET_DEFCALIBRATIONVERFIED: 0xEB,
  /** [Flywheel speed, rpm (MSB), Flywheel speed, rpm (LSB)] */
  CSAFE_PM_GET_FLYWHEELSPEED: 0xEC,
  /** [Erg machine type] */
  CSAFE_PM_GET_ERGMACHINETYPE: 0xED,
  /** [Race begin tick time, (MSB), Race begin tick time, ..., Race end tick time (LSB)] */
  CSAFE_PM_GET_RACE_BEGINEND_TICKCOUNT: 0xEE,
  /** [Update info type (MSB), Update info type (LSB), Update status (MSB), Update status (LSB)] */
  CSAFE_PM_GET_PM5_FWUPDATESTATUS: 0xEF
}

export const shortCommands = {
  ...PublicShortCommands,
  ...ProprietaryShortGetDataCommands,
  ...ProprietaryShortGetConfigCommands
}
export const longCommands = {
  ...PublicLongCommands,
  ...ProprietaryLongGetDataCommands,
  ...ProprietaryLongGetConfigCommands,
  ...ProprietaryLongSetDataCommands,
  ...ProprietaryLongSetConfigCommands
}

/**
 * @readonly
 * @enum {number}
 */
export const WorkoutTypes = {
  /** JustRow, no splits (0). */
  WORKOUTTYPE_JUSTROW_NOSPLITS: 0,
  /** JustRow, splits (1). */
  WORKOUTTYPE_JUSTROW_SPLITS: 1,
  /** Fixed distance, no splits (2). */
  WORKOUTTYPE_FIXEDDIST_NOSPLITS: 2,
  /** Fixed distance, splits (3). */
  WORKOUTTYPE_FIXEDDIST_SPLITS: 3,
  /** Fixed time, no splits (4). */
  WORKOUTTYPE_FIXEDTIME_NOSPLITS: 4,
  /** Fixed time, splits (5). */
  WORKOUTTYPE_FIXEDTIME_SPLITS: 5,
  /** Fixed time interval (6). */
  WORKOUTTYPE_FIXEDTIME_INTERVAL: 6,
  /** Fixed distance interval (7). */
  WORKOUTTYPE_FIXEDDIST_INTERVAL: 7,
  /** Variable interval (8). */
  WORKOUTTYPE_VARIABLE_INTERVAL: 8,
  /** Variable interval, undefined rest (9). */
  WORKOUTTYPE_VARIABLE_UNDEFINEDREST_INTERVAL: 9,
  /** Fixed calorie, splits (10). */
  WORKOUTTYPE_FIXEDCALORIE_SPLITS: 10,
  /** Fixed watt-minute, splits (11). */
  WORKOUTTYPE_FIXEDWATTMINUTE_SPLITS: 11,
  /** Fixed calorie interval (12). */
  WORKOUTTYPE_FIXEDCALS_INTERVAL: 12
}

/**
 * @readonly
 * @enum {number}
 */
export const IntervalTypes = {
  /** Time interval type (0). */
  INTERVALTYPE_TIME: 0,
  /** Distance interval type (1). */
  INTERVALTYPE_DIST: 1,
  /** Rest interval type (2). */
  INTERVALTYPE_REST: 2,
  /** Time undefined rest interval type (3). */
  INTERVALTYPE_TIMERESTUNDEFINED: 3,
  /** Distance undefined rest interval type (4). */
  INTERVALTYPE_DISTANCERESTUNDEFINED: 4,
  /** Undefined rest interval type (5). */
  INTERVALTYPE_RESTUNDEFINED: 5,
  /** Calorie interval type (6). */
  INTERVALTYPE_CALORIE: 6,
  /** Calorie undefined rest interval type (7). */
  INTERVALTYPE_CALORIERESTUNDEFINED: 7,
  /** Watt-minute interval type (8). */
  INTERVALTYPE_WATTMINUTE: 8,
  /** Watt-minute undefined rest interval type (9). */
  INTERVALTYPE_WATTMINUTERESTUNDEFINED: 9,
  /** No interval type (255 ). */
  INTERVALTYPE_NONE: 255
}

/**
 * @readonly
 * @enum {number}
 */
export const ScreenTypes = {
  SCREENTYPE_NONE: 0,
  /** Workout type (1). */
  SCREENTYPE_WORKOUT: 1,
  /** Race type (2). */
  SCREENTYPE_RACE: 2,
  /** CSAFE type (3). */
  SCREENTYPE_CSAFE: 3,
  /** Diagnostic type (4). */
  SCREENTYPE_DIAG: 4,
  /** Manufacturing type (5). */
  SCREENTYPE_MFG: 5
}

/**
 * @readonly
 * @enum {number}
 */
export const ScreenValue = {
  /** < None value (0). */
  SCREENVALUEWORKOUT_NONE: 0,
  /** < Prepare to workout type (1). */
  SCREENVALUEWORKOUT_PREPARETOROWWORKOUT: 1,
  /** < Terminate workout type (2). */
  SCREENVALUEWORKOUT_TERMINATEWORKOUT: 2,
  /** < Rearm workout type (3). */
  SCREENVALUEWORKOUT_REARMWORKOUT: 3,
  /** < Refresh local copies of logcard structures(4). */
  SCREENVALUEWORKOUT_REFRESHLOGCARD: 4,
  /** < Prepare to race start (5). */
  SCREENVALUEWORKOUT_PREPARETORACESTART: 5,
  /** < Goto to main screen (6). */
  SCREENVALUEWORKOUT_GOTOMAINSCREEN: 6,
  /** < Log device busy warning (7). */
  SCREENVALUEWORKOUT_LOGCARDBUSYWARNING: 7,
  /** < Log device select user (8). */
  SCREENVALUEWORKOUT_LOGCARDSELECTUSER: 8,
  /** < Reset race parameters (9). */
  SCREENVALUEWORKOUT_RESETRACEPARAMS: 9,
  /** < Cable test slave indication(10). */
  SCREENVALUEWORKOUT_CABLETESTSLAVE: 10,
  /** < Fish game (11). */
  SCREENVALUEWORKOUT_FISHGAME: 11,
  /** < Display participant info (12). */
  SCREENVALUEWORKOUT_DISPLAYPARTICIPANTINFO: 12,
  /** < Display participant info w/ confirmation (13). */
  SCREENVALUEWORKOUT_DISPLAYPARTICIPANTINFOCONFIRM: 13,
  /** < Display type set to target (20). */
  SCREENVALUEWORKOUT_CHANGEDISPLAYTYPETARGET: 20,
  /** < Display type set to standard (21). */
  SCREENVALUEWORKOUT_CHANGEDISPLAYTYPESTANDARD: 21,
  /** < Display type set to forcevelocity (22). */
  SCREENVALUEWORKOUT_CHANGEDISPLAYTYPEFORCEVELOCITY: 22,
  /** < Display type set to Paceboat (23). */
  SCREENVALUEWORKOUT_CHANGEDISPLAYTYPEPACEBOAT: 23,
  /** < Display type set to perstroke (24). */
  SCREENVALUEWORKOUT_CHANGEDISPLAYTYPEPERSTROKE: 24,
  /** < Display type set to simple (25). */
  SCREENVALUEWORKOUT_CHANGEDISPLAYTYPESIMPLE: 25,
  /** < Units type set to timemeters (30). */
  SCREENVALUEWORKOUT_CHANGEUNITSTYPETIMEMETERS: 30,
  /** < Units type set to pace (31). */
  SCREENVALUEWORKOUT_CHANGEUNITSTYPEPACE: 31,
  /** < Units type set to watts (32). */
  SCREENVALUEWORKOUT_CHANGEUNITSTYPEWATTS: 32,
  /** < Units type set to caloric burn rate(33). */
  SCREENVALUEWORKOUT_CHANGEUNITSTYPECALORICBURNRATE: 33,
  /** < Basic target game (34). */
  SCREENVALUEWORKOUT_TARGETGAMEBASIC: 34,
  /** < Advanced target game (35). */
  SCREENVALUEWORKOUT_TARGETGAMEADVANCED: 35,
  /** < Dart game (36). */
  SCREENVALUEWORKOUT_DARTGAME: 36,
  /** < USB wait ready (37). */
  SCREENVALUEWORKOUT_GOTOUSBWAITREADY: 37,
  /** < Tach cable test disable (38). */
  SCREENVALUEWORKOUT_TACHCABLETESTDISABLE: 38,
  /** < Tach simulator disable (39). */
  SCREENVALUEWORKOUT_TACHSIMDISABLE: 39,
  /** < Tach simulator enable, rate = 1:12 (40). */
  SCREENVALUEWORKOUT_TACHSIMENABLERATE1: 40,
  /** < Tach simulator enable, rate = 1:35 (41). */
  SCREENVALUEWORKOUT_TACHSIMENABLERATE2: 41,
  /** < Tach simulator enable, rate = 1:42 (42). */
  SCREENVALUEWORKOUT_TACHSIMENABLERATE3: 42,
  /** < Tach simulator enable, rate = 3:04 (43). */
  SCREENVALUEWORKOUT_TACHSIMENABLERATE4: 43,
  /** < Tach simulator enable, rate = 3:14 (44). */
  SCREENVALUEWORKOUT_TACHSIMENABLERATE5: 44,
  /** < Tach cable test enable (45). */
  SCREENVALUEWORKOUT_TACHCABLETESTENABLE: 45,
  /** < Units type set to calories(46). */
  SCREENVALUEWORKOUT_CHANGEUNITSTYPECALORIES: 46,
  /** < Virtual key select A (47). */
  SCREENVALUEWORKOUT_VIRTUALKEY_A: 47,
  /** < Virtual key select B (48). */
  SCREENVALUEWORKOUT_VIRTUALKEY_B: 48,
  /** < Virtual key select C (49). */
  SCREENVALUEWORKOUT_VIRTUALKEY_C: 49,
  /** < Virtual key select D (50). */
  SCREENVALUEWORKOUT_VIRTUALKEY_D: 50,
  /** < Virtual key select E (51). */
  SCREENVALUEWORKOUT_VIRTUALKEY_E: 51,
  /** < Virtual key select Units (52). */
  SCREENVALUEWORKOUT_VIRTUALKEY_UNITS: 52,
  /** < Virtual key select Display (53). */
  SCREENVALUEWORKOUT_VIRTUALKEY_DISPLAY: 53,
  /** < Virtual key select Menu (54). */
  SCREENVALUEWORKOUT_VIRTUALKEY_MENU: 54,
  /** < Tach simulator enable, rate = random (55). */
  SCREENVALUEWORKOUT_TACHSIMENABLERATERANDOM: 55,
  /** < Screen redraw (255). */
  SCREENVALUEWORKOUT_SCREENREDRAW: 255
}

/**
 * @readonly
 * @enum {number}
 */
export const OperationalStates = {
  OPERATIONALSTATE_RESET: 0, // Reset state
  OPERATIONALSTATE_READY: 1, //  Ready state
  OPERATIONALSTATE_WORKOUT: 2, // Workout state
  OPERATIONALSTATE_WARMUP: 3, // Warm-up state
  OPERATIONALSTATE_RACE: 4, // Race state
  OPERATIONALSTATE_POWEROFF: 5, // Power-off state
  OPERATIONALSTATE_PAUSE: 6, // Pause state
  OPERATIONALSTATE_INVOKEBOOTLOADER: 7, // Invoke boot loader state
  OPERATIONALSTATE_POWEROFF_SHIP: 8, // Power-off ship state
  OPERATIONALSTATE_IDLE_CHARGE: 9, // Idle charge state
  OPERATIONALSTATE_IDLE: 10, // Idle state
  OPERATIONALSTATE_MFGTEST: 11, // Manufacturing test state
  OPERATIONALSTATE_FWUPDATE: 12, // Firmware update state
  OPERATIONALSTATE_DRAGFACTOR: 13, // Drag factor state
  OPERATIONALSTATE_DFCALIBRATION: 100 // Drag factor calibration state
}

/**
 * @typedef {Extract<keyof ReverseKeyValue<longCommands | shortCommands>, number>} CsafeCommandsNumbers
 */
