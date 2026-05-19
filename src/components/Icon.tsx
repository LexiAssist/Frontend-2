"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// Icon mapping based on ICON_INDEX.md
const iconMap: Record<string, string> = {
  // Navigation
  home: "/icon/style=bold-94.svg",
  "home-linear": "/icon/style=linear-94.svg",
  menu: "/icon/style=bold-92.svg",
  "menu-linear": "/icon/style=linear-92.svg",
  search: "/icon/style=bold-115.svg",
  "search-linear": "/icon/style=linear-115.svg",
  "arrow-left": "/icon/style=linear-196.svg",
  "arrow-right": "/icon/style=linear-197.svg",
  "arrow-up": "/icon/style=linear-199.svg",
  "arrow-down": "/icon/style=linear-192.svg",
  "chevron-left": "/icon/style=linear-203.svg",
  "chevron-right": "/icon/style=bold-116.svg",
  "chevron-down": "/icon/style=linear-203.svg",
  "chevron-up": "/icon/style=linear-203.svg",
  
  // Actions
  save: "/icon/style=bold-75.svg",
  "save-linear": "/icon/style=linear-75.svg",
  delete: "/icon/style=bold-74.svg",
  "delete-linear": "/icon/style=linear-74.svg",
  trash: "/icon/style=bold-74.svg",
  edit: "/icon/style=bold-109.svg",
  "edit-linear": "/icon/style=linear-109.svg",
  pencil: "/icon/style=bold-212.svg",
  send: "/icon/style=bold-7.svg",
  "send-linear": "/icon/style=linear-6.svg",
  download: "/icon/style=bold-81.svg",
  "download-linear": "/icon/style=linear-81.svg",
  upload: "/icon/style=bold-129.svg",
  "upload-linear": "/icon/style=linear-129.svg",
  close: "/icon/style=bold-126.svg",
  "close-linear": "/icon/style=linear-126.svg",
  x: "/icon/style=bold-126.svg",
  check: "/icon/style=bold-77.svg",
  "check-linear": "/icon/style=linear-78.svg",
  "check-circle": "/icon/style=bold-130.svg",
  plus: "/icon/style=bold-111.svg",
  "plus-linear": "/icon/style=linear-112.svg",
  minus: "/icon/style=bold-104.svg",
  "minus-linear": "/icon/style=linear-104.svg",
  copy: "/icon/style=bold-153.svg",
  "copy-linear": "/icon/style=linear-153.svg",
  refresh: "/icon/style=bold-238.svg",
  "refresh-linear": "/icon/style=linear-183.svg",
  
  // Status
  success: "/icon/style=bold-130.svg",
  warning: "/icon/style=bold-98.svg",
  "warning-linear": "/icon/style=linear-97.svg",
  error: "/icon/style=bold-99.svg",
  "error-linear": "/icon/style=linear-98.svg",
  info: "/icon/style=linear-99.svg",
  loading: "/icon/style=linear-84.svg",
  spinner: "/icon/style=linear-85.svg",
  
  // Communication
  mail: "/icon/style=bold-255.svg",
  "mail-linear": "/icon/style=linear-286.svg",
  email: "/icon/style=bold-255.svg",
  "email-linear": "/icon/style=linear-286.svg",
  chat: "/icon/style=bold-258.svg",
  "chat-linear": "/icon/style=linear-291.svg",
  message: "/icon/style=bold-315.svg",
  "message-linear": "/icon/style=linear-292.svg",
  notification: "/icon/style=bold-72.svg",
  "notification-linear": "/icon/style=linear-72.svg",
  bell: "/icon/style=bold-72.svg",
  "bell-linear": "/icon/style=linear-72.svg",
  phone: "/icon/style=bold-17.svg",
  "phone-linear": "/icon/style=linear-16.svg",
  
  // Media
  play: "/icon/style=bold-233.svg",
  "play-linear": "/icon/style=linear-270.svg",
  pause: "/icon/style=bold-234.svg",
  "pause-linear": "/icon/style=linear-269.svg",
  image: "/icon/style=linear-69.svg",
  camera: "/icon/style=linear-71.svg",
  video: "/icon/style=bold-244.svg",
  "video-linear": "/icon/style=linear-279.svg",
  microphone: "/icon/style=bold-229.svg",
  "microphone-linear": "/icon/style=linear-264.svg",
  "microphone-off": "/icon/style=bold-230.svg",
  "microphone-off-linear": "/icon/style=linear-265.svg",
  volume: "/icon/style=bold-247.svg",
  "volume-linear": "/icon/style=linear-282.svg",
  "volume-mute": "/icon/style=bold-249.svg",
  "volume-mute-linear": "/icon/style=linear-284.svg",
  music: "/icon/style=bold-3.svg",
  "music-linear": "/icon/style=linear-3.svg",
  
  // Users
  user: "/icon/style=bold-5.svg",
  "user-linear": "/icon/style=linear-4.svg",
  "user-group": "/icon/style=bold-4.svg",
  "user-add": "/icon/style=bold-369.svg",
  "user-add-linear": "/icon/style=linear-405.svg",
  "user-remove": "/icon/style=bold-370.svg",
  "user-check": "/icon/style=bold-375.svg",
  "user-check-linear": "/icon/style=linear-408.svg",
  "users-group": "/icon/style=bold-373.svg",
  "users-group-linear": "/icon/style=linear-411.svg",
  profile: "/icon/style=bold-368.svg",
  
  // Files
  file: "/icon/style=bold-66.svg",
  "file-linear": "/icon/style=linear-67.svg",
  folder: "/icon/style=bold-67.svg",
  "folder-linear": "/icon/style=linear-68.svg",
  document: "/icon/style=bold-154.svg",
  "document-linear": "/icon/style=linear-155.svg",
  "folder-add": "/icon/style=bold-161.svg",
  "folder-add-linear": "/icon/style=linear-162.svg",
  
  // Finance
  wallet: "/icon/style=bold-167.svg",
  "wallet-linear": "/icon/style=linear-141.svg",
  "credit-card": "/icon/style=bold-172.svg",
  "credit-card-linear": "/icon/style=linear-171.svg",
  "shopping-cart": "/icon/style=bold-136.svg",
  "shopping-cart-linear": "/icon/style=linear-136.svg",
  cart: "/icon/style=bold-136.svg",
  dollar: "/icon/style=linear-23.svg",
  coins: "/icon/style=bold-179.svg",
  
  // Security
  lock: "/icon/style=bold-278.svg",
  "lock-linear": "/icon/style=linear-313.svg",
  "lock-open": "/icon/style=bold-279.svg",
  "lock-open-linear": "/icon/style=linear-314.svg",
  shield: "/icon/style=bold-280.svg",
  "shield-linear": "/icon/style=linear-316.svg",
  "shield-check": "/icon/style=bold-282.svg",
  "shield-check-linear": "/icon/style=linear-318.svg",
  key: "/icon/style=bold-277.svg",
  "key-linear": "/icon/style=linear-312.svg",
  fingerprint: "/icon/style=bold-276.svg",
  "fingerprint-linear": "/icon/style=linear-311.svg",
  eye: "/icon/style=bold-273.svg",
  "eye-linear": "/icon/style=linear-308.svg",
  "eye-off": "/icon/style=bold-274.svg",
  "eye-off-linear": "/icon/style=linear-309.svg",
  
  // UI/Settings
  settings: "/icon/style=bold-6.svg",
  "settings-linear": "/icon/style=linear-5.svg",
  gear: "/icon/style=bold-6.svg",
  "gear-linear": "/icon/style=linear-5.svg",
  filter: "/icon/style=bold-91.svg",
  "filter-linear": "/icon/style=linear-91.svg",
  sliders: "/icon/style=bold-119.svg",
  "sliders-linear": "/icon/style=linear-119.svg",
  grid: "/icon/style=bold-31.svg",
  "grid-linear": "/icon/style=linear-32.svg",
  list: "/icon/style=bold-294.svg",
  "list-linear": "/icon/style=linear-331.svg",
  "more-horizontal": "/icon/style=bold-83.svg",
  "more-horizontal-linear": "/icon/style=linear-82.svg",
  "more-vertical": "/icon/style=bold-84.svg",
  "more-vertical-linear": "/icon/style=linear-83.svg",
  
  // Time
  clock: "/icon/style=bold-71.svg",
  "clock-linear": "/icon/style=linear-60.svg",
  calendar: "/icon/style=bold-319.svg",
  "calendar-linear": "/icon/style=linear-355.svg",
  history: "/icon/style=bold-326.svg",
  "history-linear": "/icon/style=linear-362.svg",
  timer: "/icon/style=bold-328.svg",
  
  // Weather
  sun: "/icon/style=bold-361.svg",
  "sun-linear": "/icon/style=linear-397.svg",
  moon: "/icon/style=bold-357.svg",
  "moon-linear": "/icon/style=linear-394.svg",
  cloud: "/icon/style=bold-149.svg",
  "cloud-linear": "/icon/style=linear-387.svg",
  
  // Education/Features
  book: "/icon/style=bold-141.svg",
  "book-linear": "/icon/style=linear-142.svg",
  "open-book": "/icon/style=bold-143.svg",
  "open-book-linear": "/icon/style=linear-143.svg",
  "graduation-cap": "/icon/style=bold-145.svg",
  "graduation-cap-linear": "/icon/style=linear-145.svg",
  award: "/icon/style=bold-146.svg",
  "award-linear": "/icon/style=linear-338.svg",
  medal: "/icon/style=bold-311.svg",
  "medal-linear": "/icon/style=linear-338.svg",
  bookmark: "/icon/style=bold-75.svg",
  "bookmark-linear": "/icon/style=linear-75.svg",
  "bookmark-add": "/icon/style=bold-76.svg",
  "bookmark-add-linear": "/icon/style=linear-76.svg",
  
  // Design/AI
  magic: "/icon/style=bold-1.svg",
  "magic-linear": "/icon/style=linear-1.svg",
  "magic-wand": "/icon/style=bold-9.svg",
  "magic-wand-linear": "/icon/style=linear-8.svg",
  sparkle: "/icon/style=bold-363.svg",
  "sparkle-linear": "/icon/style=linear-399.svg",
  brush: "/icon/style=bold-2.svg",
  "brush-linear": "/icon/style=linear-2.svg",
  pen: "/icon/style=bold-212.svg",
  "pen-linear": "/icon/style=linear-248.svg",
  palette: "/icon/style=bold-89.svg",
  "palette-linear": "/icon/style=linear-88.svg",
  
  // Business
  dashboard: "/icon/style=bold-30.svg",
  "dashboard-linear": "/icon/style=linear-36.svg",
  chart: "/icon/style=bold-34.svg",
  "chart-linear": "/icon/style=linear-34.svg",
  "chart-down": "/icon/style=bold-35.svg",
  "chart-up": "/icon/style=bold-36.svg",
  stats: "/icon/style=bold-40.svg",
  "stats-linear": "/icon/style=linear-40.svg",
  building: "/icon/style=bold-12.svg",
  "building-linear": "/icon/style=linear-11.svg",
  
  // Development
  code: "/icon/style=bold-69.svg",
  "code-linear": "/icon/style=linear-301.svg",
  terminal: "/icon/style=bold-272.svg",
  "terminal-linear": "/icon/style=linear-307.svg",
  bug: "/icon/style=bold-264.svg",
  "bug-linear": "/icon/style=linear-300.svg",
  "git-branch": "/icon/style=bold-268.svg",
  "git-merge": "/icon/style=bold-271.svg",
  
  // Devices
  laptop: "/icon/style=bold-56.svg",
  "laptop-linear": "/icon/style=linear-51.svg",
  mobile: "/icon/style=bold-52.svg",
  "mobile-linear": "/icon/style=linear-56.svg",
  tablet: "/icon/style=bold-53.svg",
  "tablet-linear": "/icon/style=linear-57.svg",
  monitor: "/icon/style=bold-51.svg",
  "monitor-linear": "/icon/style=linear-52.svg",
  keyboard: "/icon/style=bold-50.svg",
  "keyboard-linear": "/icon/style=linear-50.svg",
  mouse: "/icon/style=bold-48.svg",
  "mouse-linear": "/icon/style=linear-53.svg",
  
  // Connectivity
  wifi: "/icon/style=bold-64.svg",
  "wifi-linear": "/icon/style=linear-64.svg",
  bluetooth: "/icon/style=linear-47.svg",
  "cloud-server": "/icon/style=bold-57.svg",
  "cloud-upload": "/icon/style=bold-58.svg",
  "cloud-download": "/icon/style=bold-59.svg",
  
  // Navigation specific
  logout: "/icon/style=bold-124.svg",
  "logout-linear": "/icon/style=linear-124.svg",
  login: "/icon/style=bold-123.svg",
  "login-linear": "/icon/style=linear-123.svg",
  external: "/icon/style=linear-195.svg",
  "external-link": "/icon/style=linear-195.svg",
  link: "/icon/style=bold-102.svg",
  "link-linear": "/icon/style=linear-102.svg",
  
  // Heart/Like
  heart: "/icon/style=bold-93.svg",
  "heart-linear": "/icon/style=linear-93.svg",
  like: "/icon/style=bold-93.svg",
  "like-linear": "/icon/style=linear-93.svg",
  
  // Location
  location: "/icon/style=bold-193.svg",
  "location-linear": "/icon/style=linear-96.svg",
  pin: "/icon/style=bold-193.svg",
  "pin-linear": "/icon/style=linear-96.svg",
  map: "/icon/style=bold-196.svg",
  "map-linear": "/icon/style=linear-375.svg",
  flag: "/icon/style=bold-96.svg",
  "flag-linear": "/icon/style=linear-77.svg",
  
  // Help
  help: "/icon/style=bold-128.svg",
  "help-linear": "/icon/style=linear-128.svg",
  question: "/icon/style=bold-128.svg",
  "question-linear": "/icon/style=linear-128.svg",
  
  // Print/Share
  print: "/icon/style=linear-54.svg",
  share: "/icon/style=bold-121.svg",
  "share-linear": "/icon/style=linear-121.svg",
  
  // Target/Focus
  target: "/icon/style=bold-147.svg",
  "target-linear": "/icon/style=linear-118.svg",
  crosshair: "/icon/style=bold-337.svg",
  scan: "/icon/style=bold-8.svg",
  "scan-linear": "/icon/style=linear-7.svg",
  
  // Emoji
  smile: "/icon/style=bold-87.svg",
  "smile-linear": "/icon/style=linear-86.svg",
  emoji: "/icon/style=bold-87.svg",
  "emoji-linear": "/icon/style=linear-86.svg",
  
  // Shopping
  store: "/icon/style=bold-133.svg",
  "store-linear": "/icon/style=linear-125.svg",
  shop: "/icon/style=bold-133.svg",
  bag: "/icon/style=linear-133.svg",
  "shopping-bag": "/icon/style=linear-133.svg",
  tag: "/icon/style=bold-28.svg",
  "tag-linear": "/icon/style=linear-184.svg",
  
  // Science
  flask: "/icon/style=bold-134.svg",
  "flask-linear": "/icon/style=linear-144.svg",
  beaker: "/icon/style=bold-144.svg",
  "beaker-linear": "/icon/style=linear-144.svg",
  
  // Nature
  leaf: "/icon/style=bold-122.svg",
  tree: "/icon/style=linear-380.svg",
  "tree-linear": "/icon/style=linear-296.svg",
  flower: "/icon/style=linear-294.svg",
  
  // Archive
  archive: "/icon/style=bold-135.svg",
  "archive-linear": "/icon/style=linear-135.svg",
  
  // Layers
  layers: "/icon/style=bold-223.svg",
  "layers-linear": "/icon/style=linear-260.svg",
  
  // Grip/Drag
  grip: "/icon/style=linear-84.svg",
  
  // AI specific
  ai: "/icon/style=linear-351.svg",
  brain: "/icon/style=linear-351.svg",
  robot: "/icon/style=linear-353.svg",
  "robot-linear": "/icon/style=linear-297.svg",
  
  // Headphones/Support
  headphones: "/icon/style=bold-377.svg",
  "headphones-linear": "/icon/style=linear-413.svg",
  support: "/icon/style=bold-377.svg",
  "support-linear": "/icon/style=linear-413.svg",
  
  // Globe
  globe: "/icon/style=linear-346.svg",
  "globe-linear": "/icon/style=linear-372.svg",
  world: "/icon/style=linear-346.svg",
  
  // Rocket
  rocket: "/icon/style=bold-345.svg",
  "rocket-linear": "/icon/style=linear-89.svg",
  
  // Transport
  bus: "/icon/style=bold-333.svg",
  "bus-linear": "/icon/style=linear-347.svg",
  truck: "/icon/style=bold-330.svg",
  "truck-linear": "/icon/style=linear-366.svg",
  
  // Checkbox
  "check-square": "/icon/style=bold-79.svg",
  "check-square-linear": "/icon/style=linear-80.svg",
  checkbox: "/icon/style=bold-79.svg",
  "checkbox-linear": "/icon/style=linear-80.svg",
  
  // Panel
  panel: "/icon/style=linear-82.svg",
  
  // More
  more: "/icon/style=bold-83.svg",
  
  // Circle
  circle: "/icon/style=bold-113.svg",
  "circle-linear": "/icon/style=linear-113.svg",
  "circle-filled": "/icon/style=bold-113.svg",
  "circle-outline": "/icon/style=bold-114.svg",
  
  // Chevron
  chevron: "/icon/style=bold-116.svg",
  
  // Inbox
  inbox: "/icon/style=bold-125.svg",
  
  // Italic
  italic: "/icon/style=bold-142.svg",
  
  // Backpack
  backpack: "/icon/style=bold-148.svg",
  "backpack-linear": "/icon/style=linear-245.svg",
  
  // Activity
  activity: "/icon/style=bold-206.svg",
  "activity-linear": "/icon/style=linear-242.svg",
  pulse: "/icon/style=bold-206.svg",
  "pulse-linear": "/icon/style=linear-242.svg",
  heartbeat: "/icon/style=bold-205.svg",
  "heartbeat-linear": "/icon/style=linear-241.svg",
  
  // Crop
  crop: "/icon/style=bold-213.svg",
  "crop-linear": "/icon/style=linear-249.svg",
  
  // Gallery/Image
  gallery: "/icon/style=bold-217.svg",
  "gallery-linear": "/icon/style=linear-253.svg",
  "image-add": "/icon/style=bold-219.svg",
  "image-add-linear": "/icon/style=linear-254.svg",
  "image-remove": "/icon/style=bold-220.svg",
  "image-remove-linear": "/icon/style=linear-256.svg",
  "image-check": "/icon/style=bold-221.svg",
  "image-check-linear": "/icon/style=linear-255.svg",
  
  // Megaphone
  megaphone: "/icon/style=bold-225.svg",
  "megaphone-linear": "/icon/style=linear-261.svg",
  announcement: "/icon/style=bold-225.svg",
  
  // Sunglasses
  sunglasses: "/icon/style=bold-227.svg",
  
  // Gamepad
  gamepad: "/icon/style=bold-49.svg",
  "gamepad-linear": "/icon/style=linear-48.svg",
  
  // Fast forward
  "fast-forward": "/icon/style=bold-232.svg",
  "fast-forward-linear": "/icon/style=linear-244.svg",
  rewind: "/icon/style=bold-236.svg",
  "rewind-linear": "/icon/style=linear-252.svg",
  "skip-back": "/icon/style=bold-236.svg",
  "skip-forward": "/icon/style=bold-232.svg",
  
  // Shuffle/Repeat
  shuffle: "/icon/style=bold-239.svg",
  "shuffle-linear": "/icon/style=linear-274.svg",
  repeat: "/icon/style=linear-273.svg",
  loop: "/icon/style=linear-273.svg",
  
  // Stop
  stop: "/icon/style=bold-243.svg",
  "stop-linear": "/icon/style=linear-285.svg",
  
  // Volume levels
  "volume-high": "/icon/style=bold-247.svg",
  "volume-high-linear": "/icon/style=linear-282.svg",
  "volume-medium": "/icon/style=bold-248.svg",
  "volume-medium-linear": "/icon/style=linear-283.svg",
  "volume-low": "/icon/style=linear-65.svg",
  "volume-off": "/icon/style=bold-249.svg",
  
  // Mail variants
  "mail-check": "/icon/style=bold-251.svg",
  "mail-check-linear": "/icon/style=linear-288.svg",
  "mail-add": "/icon/style=bold-252.svg",
  "mail-add-linear": "/icon/style=linear-287.svg",
  "mail-remove": "/icon/style=bold-253.svg",
  "mail-remove-linear": "/icon/style=linear-289.svg",
  
  // Chat variants
  "chat-check": "/icon/style=linear-288.svg",
  "chat-multiple": "/icon/style=linear-293.svg",
  
  // Emoji variants
  "emoji-happy": "/icon/style=bold-87.svg",
  "emoji-happy-linear": "/icon/style=linear-86.svg",
  "emoji-neutral": "/icon/style=bold-263.svg",
  "emoji-neutral-linear": "/icon/style=linear-86.svg",
  
  // Git
  "git-commit": "/icon/style=bold-269.svg",
  "git-pull-request": "/icon/style=bold-270.svg",
  
  // Face ID
  "face-id": "/icon/style=bold-275.svg",
  
  // Shield variants
  "shield-off": "/icon/style=bold-281.svg",
  
  // Anchor
  anchor: "/icon/style=bold-284.svg",
  
  // Align
  "align-center": "/icon/style=bold-285.svg",
  "align-justify": "/icon/style=bold-286.svg",
  "align-left": "/icon/style=bold-287.svg",
  "align-right": "/icon/style=bold-288.svg",
  "align-left-linear": "/icon/style=linear-33.svg",
  
  // List variants
  "list-check": "/icon/style=bold-295.svg",
  indent: "/icon/style=bold-296.svg",
  outdent: "/icon/style=bold-296.svg",
  
  // Font
  font: "/icon/style=bold-297.svg",
  "font-linear": "/icon/style=linear-332.svg",
  typography: "/icon/style=bold-297.svg",
  
  // Flashlight
  flashlight: "/icon/style=bold-298.svg",
  torch: "/icon/style=bold-298.svg",
  
  // Hashtag
  hashtag: "/icon/style=bold-299.svg",
  
  // Text formatting
  "split-text": "/icon/style=bold-301.svg",
  
  // Hand
  hand: "/icon/style=bold-303.svg",
  "hand-point": "/icon/style=bold-306.svg",
  pointer: "/icon/style=bold-303.svg",
  "pointer-linear": "/icon/style=linear-117.svg",
  cursor: "/icon/style=bold-108.svg",
  
  // Traffic
  "traffic-cone": "/icon/style=bold-304.svg",
  
  // Gift
  gift: "/icon/style=bold-305.svg",
  present: "/icon/style=bold-305.svg",
  
  // Thumb
  "thumb-down": "/icon/style=bold-307.svg",
  dislike: "/icon/style=bold-307.svg",
  
  // Drink
  drink: "/icon/style=bold-308.svg",
  bottle: "/icon/style=bold-308.svg",
  cocktail: "/icon/style=bold-309.svg",
  milkshake: "/icon/style=bold-309.svg",
  
  // Database
  database: "/icon/style=bold-310.svg",
  
  // Pen tool
  "pen-tool": "/icon/style=bold-312.svg",
  "pen-tool-linear": "/icon/style=linear-267.svg",
  "pen-nib": "/icon/style=bold-312.svg",
  
  // Book variants
  "book-lock": "/icon/style=bold-313.svg",
  "book-closed": "/icon/style=bold-313.svg",
  
  // Display
  display: "/icon/style=bold-314.svg",
  stand: "/icon/style=bold-314.svg",
  
  // Undo
  undo: "/icon/style=bold-316.svg",
  
  // Seats
  seats: "/icon/style=bold-317.svg",
  
  // Clock variants
  "clock-history": "/icon/style=bold-318.svg",
  
  // Calendar variants
  "calendar-add": "/icon/style=bold-320.svg",
  "calendar-add-linear": "/icon/style=linear-356.svg",
  "calendar-check": "/icon/style=bold-321.svg",
  "calendar-check-linear": "/icon/style=linear-358.svg",
  "calendar-remove": "/icon/style=bold-322.svg",
  "calendar-remove-linear": "/icon/style=linear-357.svg",
  "calendar-minus": "/icon/style=bold-323.svg",
  "calendar-edit": "/icon/style=bold-324.svg",
  
  // Stopwatch
  stopwatch: "/icon/style=bold-328.svg",
  "stopwatch-linear": "/icon/style=linear-364.svg",
  hourglass: "/icon/style=linear-365.svg",
  
  // Delivery
  delivery: "/icon/style=bold-330.svg",
  "delivery-linear": "/icon/style=linear-366.svg",
  
  // Map variants
  "map-locations": "/icon/style=bold-331.svg",
  "map-paths": "/icon/style=bold-339.svg",
  
  // Diploma
  diploma: "/icon/style=bold-332.svg",
  certificate: "/icon/style=bold-332.svg",
  
  // Play variants
  "play-circle": "/icon/style=bold-334.svg",
  "play-circle-linear": "/icon/style=linear-370.svg",
  
  // Compass
  compass: "/icon/style=bold-336.svg",
  "compass-linear": "/icon/style=linear-251.svg",
  
  // Target variants
  bullseye: "/icon/style=bold-147.svg",
  
  // Route
  route: "/icon/style=bold-343.svg",
  path: "/icon/style=bold-339.svg",
  
  // Diamond
  diamond: "/icon/style=bold-342.svg",
  gem: "/icon/style=bold-342.svg",
  
  // Shield sparkle
  "shield-sparkle": "/icon/style=bold-344.svg",
  
  // Waypoints
  waypoints: "/icon/style=bold-346.svg",
  
  // Takeout
  takeout: "/icon/style=bold-347.svg",
  "food-box": "/icon/style=bold-347.svg",
  
  // Weather variants
  "cloudy-night": "/icon/style=bold-349.svg",
  "cloud-rain": "/icon/style=bold-350.svg",
  rainy: "/icon/style=bold-350.svg",
  cloudy: "/icon/style=bold-351.svg",
  "cloudy-linear": "/icon/style=linear-390.svg",
  rain: "/icon/style=bold-352.svg",
  snow: "/icon/style=bold-353.svg",
  "snow-linear": "/icon/style=linear-391.svg",
  "cloudy-moon": "/icon/style=bold-354.svg",
  lightning: "/icon/style=bold-355.svg",
  "lightning-linear": "/icon/style=linear-392.svg",
  thunder: "/icon/style=bold-355.svg",
  "flash-off": "/icon/style=bold-356.svg",
  night: "/icon/style=bold-357.svg",
  "night-linear": "/icon/style=linear-394.svg",
  thermometer: "/icon/style=bold-358.svg",
  "thermometer-linear": "/icon/style=linear-402.svg",
  "temperature-warning": "/icon/style=linear-403.svg",
  stars: "/icon/style=bold-359.svg",
  snowflake: "/icon/style=bold-360.svg",
  "sun-rays": "/icon/style=bold-364.svg",
  "sun-cloud": "/icon/style=bold-365.svg",
  "cloud-sun": "/icon/style=linear-401.svg",
  heat: "/icon/style=bold-366.svg",
  
  // Filter
  "filter-funnel": "/icon/style=bold-367.svg",
  funnel: "/icon/style=bold-367.svg",
  
  // User variants
  "user-circle": "/icon/style=bold-371.svg",
  "user-circle-linear": "/icon/style=linear-404.svg",
  "user-x": "/icon/style=bold-372.svg",
  "user-minus": "/icon/style=bold-374.svg",
  "user-minus-linear": "/icon/style=linear-407.svg",
  "user-heart": "/icon/style=linear-409.svg",
  "user-settings": "/icon/style=linear-410.svg",
  "users-linear": "/icon/style=linear-411.svg",
  "user-remove-linear": "/icon/style=linear-412.svg",
  
  // Chat message
  "chat-message": "/icon/style=bold.svg",
  "chat-message-linear": "/icon/styles=linear.svg",
  "chat-dots": "/icon/styles=bold-1.svg",
  "chat-dots-linear": "/icon/styles=linear-1.svg",
  "chat-bubbles": "/icon/styles=bold-2.svg",
  "chat-bubbles-linear": "/icon/styles=linear-2.svg",
  
  // More variants
  "more-dots": "/icon/styles=bold-1.svg",
  "more-dots-linear": "/icon/styles=linear-1.svg",
  
  // Panel left
  "panel-left": "/icon/style=linear-82.svg",
  
  // Loader
  loader: "/icon/style=linear-85.svg",
  
  // Alert
  "alert-circle": "/icon/style=bold-97.svg",
  "alert-circle-linear": "/icon/style=linear-98.svg",
  "alert-triangle": "/icon/style=bold-98.svg",
  "alert-triangle-linear": "/icon/style=linear-377.svg",
  "alert-octagon": "/icon/style=bold-99.svg",
  
  // Info
  "info-circle": "/icon/style=linear-99.svg",
  
  // Circle check
  "circle-check": "/icon/style=bold-80.svg",
  "circle-check-linear": "/icon/style=linear-130.svg",
  
  // Zoom
  "zoom-in": "/icon/style=bold-131.svg",
  "zoom-out": "/icon/style=bold-132.svg",
  
  // Mail notification
  "mail-notification": "/icon/style=bold-256.svg",
  "mail-notification-linear": "/icon/style=linear-72.svg",
  
  // Inbox tray
  "inbox-tray": "/icon/style=bold-125.svg",
  
  // Square
  square: "/icon/style=bold-78.svg",
  "square-linear": "/icon/style=linear-79.svg",
  
  // Record
  record: "/icon/style=linear-113.svg",
  
  // Download tray
  "download-tray": "/icon/style=bold-82.svg",
  
  // Upload tray
  "upload-tray": "/icon/style=bold-129.svg",
  
  // Sliders variants
  "sliders-horizontal": "/icon/style=bold-120.svg",
  "sliders-horizontal-linear": "/icon/style=linear-120.svg",
  "sliders-vertical": "/icon/style=bold-119.svg",
  "sliders-vertical-linear": "/icon/style=linear-119.svg",
  
  // Grid variants
  "grid-2": "/icon/style=bold-37.svg",
  "grid-4": "/icon/style=bold-38.svg",
  "grid-apps": "/icon/style=bold-39.svg",
  
  // Layout
  "layout-split": "/icon/style=linear-30.svg",
  "layout-vertical": "/icon/style=linear-31.svg",
  "layout-2": "/icon/style=linear-41.svg",
  "layout-3": "/icon/style=linear-39.svg",
  
  // Pie chart
  "pie-chart": "/icon/style=linear-40.svg",
  
  // Battery
  "battery-linear": "/icon/style=linear-43.svg",
  "battery-charging-linear": "/icon/style=linear-44.svg",
  "battery-low-linear": "/icon/style=linear-45.svg",
  "battery-full-linear": "/icon/style=linear-46.svg",
  
  "wifi-off": "/icon/style=bold-65.svg",
  
  // File variants
  "file-add": "/icon/style=bold-155.svg",
  "file-remove": "/icon/style=bold-156.svg",
  "file-upload": "/icon/style=bold-157.svg",
  "file-download": "/icon/style=bold-158.svg",
  "file-check": "/icon/style=bold-159.svg",
  
  // Folder variants
  "folder-remove": "/icon/style=bold-162.svg",
  "folder-upload": "/icon/style=bold-163.svg",
  "folder-download": "/icon/style=bold-164.svg",
  "folder-check": "/icon/style=bold-165.svg",
  folders: "/icon/style=bold-166.svg",
  
  // Credit card variants
  "credit-card-add-linear": "/icon/style=linear-172.svg",
  "credit-card-remove-linear": "/icon/style=linear-173.svg",
  "credit-card-minus-linear": "/icon/style=linear-177.svg",
  "credit-card-check-linear": "/icon/style=linear-178.svg",
  
  // Coins
  "coins-add": "/icon/style=bold-180.svg",
  "coins-minus": "/icon/style=bold-181.svg",
  
  // Exchange
  exchange: "/icon/style=bold-182.svg",
  
  // Percent
  percent: "/icon/style=bold-183.svg",
  discount: "/icon/style=bold-183.svg",
  
  // Tag variants
  "tag-add": "/icon/style=bold-185.svg",
  "tag-remove": "/icon/style=bold-186.svg",
  
  // Bookmark variants
  "bookmark-remove": "/icon/style=bold-189.svg",
  "bookmark-remove-linear": "/icon/style=linear-76.svg",
  
  // Flag variants
  "flag-add": "/icon/style=bold-191.svg",
  "flag-remove": "/icon/style=bold-192.svg",
  
  // Location variants
  "location-add": "/icon/style=bold-194.svg",
  "location-remove": "/icon/style=bold-195.svg",
  "pin-add": "/icon/style=bold-194.svg",
  "pin-remove": "/icon/style=bold-195.svg",
  
  // Map variants
  "map-add": "/icon/style=bold-197.svg",
  "map-minus": "/icon/style=bold-198.svg",
  "map-close": "/icon/style=bold-199.svg",
  
  // Wallet variants
  "wallet-add-linear": "/icon/style=linear-233.svg",
  "wallet-minus-linear": "/icon/style=linear-234.svg",
  "wallet-check-linear": "/icon/style=linear-235.svg",
  "wallet-delete-linear": "/icon/style=linear-236.svg",
  "wallet-arrow-down-linear": "/icon/style=linear-237.svg",
  "wallet-arrow-up-linear": "/icon/style=linear-238.svg",
  
  // First aid
  "first-aid": "/icon/style=bold-203.svg",
  "medical-bag": "/icon/style=bold-203.svg",
  "medical-cross": "/icon/style=bold-204.svg",
  
  // Health
  health: "/icon/style=bold-205.svg",
  "health-linear": "/icon/style=linear-241.svg",
  stethoscope: "/icon/style=bold-207.svg",
  
  // Briefcase
  briefcase: "/icon/style=bold-209.svg",
  "work-bag": "/icon/style=bold-209.svg",
  
  // Camera variants
  "camera-flash": "/icon/style=bold-210.svg",
  "camera-off": "/icon/style=bold-211.svg",
  "camera-off-linear": "/icon/style=linear-247.svg",
  
  // Chart variants
  "chart-line": "/icon/style=bold-34.svg",
  "chart-line-linear": "/icon/style=linear-34.svg",
  "chart-line-down": "/icon/style=bold-35.svg",
  "chart-line-down-linear": "/icon/style=linear-35.svg",
  "chart-line-up": "/icon/style=bold-36.svg",
  "chart-line-up-linear": "/icon/style=linear-34.svg",
  
  // Navigation arrow
  "navigation-arrow": "/icon/style=bold-215.svg",
  
  // Previous/Next
  previous: "/icon/style=bold-216.svg",
  next: "/icon/style=linear-266.svg",
  
  // Layer
  layer: "/icon/style=bold-223.svg",
  
  // List add
  "list-add": "/icon/style=bold-224.svg",
  
  // Mic check
  
  // Mic check
  "microphone-check": "/icon/style=bold-231.svg",
  
  // Pause circle
  "pause-circle": "/icon/style=bold-237.svg",
  
  // Megaphone
  
  // Refresh sync
  "refresh-sync": "/icon/style=bold-238.svg",
  "refresh-sync-linear": "/icon/style=linear-219.svg",
  
  // Rotate
  rotate: "/icon/style=bold-241.svg",
  
  // Video variants
  "video-off": "/icon/style=bold-245.svg",
  "video-off-linear": "/icon/style=linear-280.svg",
  
  // Equalizer
  equalizer: "/icon/style=bold-246.svg",
  "equalizer-linear": "/icon/style=linear-281.svg",
  "audio-bars": "/icon/style=bold-246.svg",
  
  // Mail variants continued
  "mail-minus": "/icon/style=bold-254.svg",
  "mail-plus": "/icon/style=bold-257.svg",
  
  // Pushpin
  pushpin: "/icon/style=bold-260.svg",
  "pushpin-linear": "/icon/style=linear-107.svg",
  "pushpin-off": "/icon/style=bold-261.svg",
  "pushpin-off-linear": "/icon/style=linear-260.svg",
  
  // Code variants
  "code-brackets": "/icon/style=bold-265.svg",
  "code-brackets-linear": "/icon/style=linear-301.svg",
  braces: "/icon/style=bold-267.svg",
  "braces-linear": "/icon/style=linear-302.svg",
  "code-block": "/icon/style=bold-267.svg",
  "code-block-linear": "/icon/style=linear-302.svg",
  
  // Git
  "git-branch-linear": "/icon/style=linear-304.svg",
  "git-merge-linear": "/icon/style=linear-303.svg",
  "git-compare-linear": "/icon/style=linear-306.svg",
  "git-pull-request-linear": "/icon/style=linear-305.svg",
  
  // Face
  "face-id-linear": "/icon/style=linear-310.svg",
  
  "key-square": "/icon/style=linear-379.svg",
  
  // Lock variants
  "lock-closed-linear": "/icon/style=linear-313.svg",
  "lock-keyhole": "/icon/style=linear-314.svg",
  
  // Scan
  "scan-line": "/icon/style=linear-315.svg",
  
  // Shield variants
  "shield-x": "/icon/style=linear-317.svg",
  "shield-x-linear": "/icon/style=bold-281.svg",
  "shield-exclamation-linear": "/icon/style=linear-134.svg",
  
  // CPU
  cpu: "/icon/style=bold-54.svg",
  "cpu-linear": "/icon/style=linear-319.svg",
  chip: "/icon/style=bold-54.svg",
  "chip-linear": "/icon/style=linear-319.svg",
  
  // USB
  usb: "/icon/style=linear-320.svg",
  
  // Menu variants
  "menu-right": "/icon/style=linear-321.svg",
  "menu-left": "/icon/style=linear-323.svg",
  "menu-lines": "/icon/style=linear-322.svg",
  "menu-lines-right": "/icon/style=linear-324.svg",
  
  // Filter sliders
  "filter-sliders": "/icon/style=linear-326.svg",
  
  // Table
  table: "/icon/style=linear-328.svg",
  columns: "/icon/style=linear-328.svg",
  "split-view": "/icon/style=bold-292.svg",
  
  // Move
  move: "/icon/style=linear-218.svg",
  "move-linear": "/icon/style=linear-330.svg",
  resize: "/icon/style=linear-198.svg",
  "resize-linear": "/icon/style=linear-224.svg",
  expand: "/icon/style=linear-217.svg",
  "expand-linear": "/icon/style=linear-224.svg",
  "collapse": "/icon/style=linear-223.svg",
  fullscreen: "/icon/style=linear-217.svg",
  "exit-fullscreen": "/icon/style=linear-223.svg",
  maximize: "/icon/style=linear-224.svg",
  minimize: "/icon/style=linear-223.svg",
  
  // Arrow variants
  "arrow-left-down": "/icon/style=linear-205.svg",
  "arrow-right-down": "/icon/style=linear-206.svg",
  "arrow-up-right": "/icon/style=linear-207.svg",
  "arrow-transfer": "/icon/style=linear-226.svg",
  "arrow-transfer-vertical": "/icon/style=linear-227.svg",
  "arrow-return": "/icon/style=linear-220.svg",
  "arrow-return-right": "/icon/style=linear-228.svg",
  "arrow-external": "/icon/style=linear-201.svg",
  "arrow-expand": "/icon/style=linear-208.svg",
  
  // Scale
  scale: "/icon/style=linear-202.svg",
  balance: "/icon/style=linear-202.svg",
  justice: "/icon/style=linear-202.svg",
  
  // Code arrows
  "code-arrows": "/icon/style=linear-204.svg",
  
  // Reply
  reply: "/icon/style=linear-209.svg",
  "reply-linear": "/icon/style=linear-209.svg",
  "reply-all": "/icon/style=linear-211.svg",
  forward: "/icon/style=linear-210.svg",
  "forward-linear": "/icon/style=linear-210.svg",
  "forward-all": "/icon/style=linear-213.svg",
  
  // Return
  "return-left": "/icon/style=linear-216.svg",
  "return-up": "/icon/style=linear-212.svg",
  "return-down": "/icon/style=linear-214.svg",
  
  // Article
  article: "/icon/style=linear-230.svg",
  
  // Ticket
  ticket: "/icon/style=linear-231.svg",
  "ticket-linear": "/icon/style=linear-339.svg",
  coupon: "/icon/style=linear-231.svg",
  voucher: "/icon/style=linear-231.svg",
  
  // Package
  package: "/icon/style=linear-239.svg",
  "package-linear": "/icon/style=linear-367.svg",
  box: "/icon/style=bold-29.svg",
  "box-seal": "/icon/style=linear-239.svg",
  
  // Plus square
  "plus-square": "/icon/style=linear-240.svg",
  "zoom-in-linear": "/icon/style=linear-131.svg",
  "zoom-out-linear": "/icon/style=linear-132.svg",
  
  trophy: "/icon/style=linear-338.svg",
  
  // Corner
  "corner-radius": "/icon/style=linear-250.svg",
  
  // Playlist
  playlist: "/icon/style=bold-235.svg",
  "playlist-linear": "/icon/style=linear-271.svg",
  
  // Share variants
  "share-all-linear": "/icon/style=linear-277.svg",
  "share-network-linear": "/icon/style=linear-275.svg",
  "share-history-linear": "/icon/style=linear-276.svg",
  
  // Frame
  frame: "/icon/style=linear-278.svg",
  
  // Flower
  "flower-linear": "/icon/style=linear-294.svg",
  
  // Lamp
  lamp: "/icon/style=linear-295.svg",
  "lightbulb-linear": "/icon/style=linear-349.svg",
  "lamp-linear": "/icon/style=linear-295.svg",
  
  eco: "/icon/style=linear-380.svg",
  
  // Puzzle
  
  // Puzzle
  puzzle: "/icon/style=linear-299.svg",
  plugin: "/icon/style=linear-299.svg",
  extension: "/icon/style=linear-299.svg",
  
  // Strikethrough
  strikethrough: "/icon/style=linear-334.svg",
  
  // Superscript
  superscript: "/icon/style=linear-335.svg",
  
  // Subscript
  subscript: "/icon/style=linear-336.svg",
  
  // Text
  text: "/icon/style=linear-337.svg",
  "text-format": "/icon/style=linear-337.svg",
  
  // Discount
  "discount-ticket": "/icon/style=linear-342.svg",
  "discount-tag": "/icon/style=linear-343.svg",
  
  // Piggy bank
  "piggy-bank": "/icon/style=linear-344.svg",
  savings: "/icon/style=linear-344.svg",
  
  // Train
  train: "/icon/style=linear-348.svg",
  
  // Newspaper
  news: "/icon/style=linear-350.svg",
  paper: "/icon/style=linear-350.svg",
  
  // Transfer
  transfer: "/icon/style=linear-363.svg",
  swap: "/icon/style=linear-363.svg",
  
  // Logistic
  logistics: "/icon/style=linear-367.svg",
  
  screen: "/icon/style=linear-368.svg",
  
  "paper-plane": "/icon/style=linear-371.svg",
  "paper-plane-linear": "/icon/style=linear-335.svg",
  
  // Globe
  "globe-network": "/icon/style=linear-372.svg",
  network: "/icon/style=linear-372.svg",
  
  caution: "/icon/style=linear-377.svg",
  
  // Navigation
  navigate: "/icon/style=linear-378.svg",
  direction: "/icon/style=linear-378.svg",
  
  // Heart sparkles
  "heart-sparkle": "/icon/style=linear-382.svg",
  love: "/icon/style=linear-382.svg",
  
  // Open envelope
  "envelope-open": "/icon/style=linear-383.svg",
  
  // Bus variants
  "bus-side": "/icon/style=linear-384.svg",
  
  // Sun sparkles
  "sun-bright": "/icon/style/linear-399.svg",
  brightness: "/icon/style/linear-400.svg",
  
  // Temperature
  temperature: "/icon/style/linear-402.svg",
  fever: "/icon/style/linear-403.svg",
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  alt?: string;
}

export function Icon({ name, size = 24, className, alt }: IconProps) {
  const src = iconMap[name];
  
  if (!src) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt || `${name} icon`}
      width={size}
      height={size}
      className={cn("inline-block", className)}
      style={{ width: size, height: size }}
    />
  );
}

// Helper component for Lucide-style usage
interface IconButtonProps extends IconProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export function IconButton({ onClick, disabled, title, ...iconProps }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Icon {...iconProps} />
    </button>
  );
}

export default Icon;
