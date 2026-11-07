import { type ColorValue, Platform } from 'react-native';
// One import per glyph: the package's main file would bundle all ~1,900 Lucide icons.
import ActivityGlyph from 'lucide-react-native/icons/activity';
import AlignLeftGlyph from 'lucide-react-native/icons/text-align-start';
import ArrowDownGlyph from 'lucide-react-native/icons/arrow-down';
import ArrowLeftGlyph from 'lucide-react-native/icons/arrow-left';
import ArrowLeftRightGlyph from 'lucide-react-native/icons/arrow-left-right';
import ArrowRightGlyph from 'lucide-react-native/icons/arrow-right';
import ArrowUpGlyph from 'lucide-react-native/icons/arrow-up';
import AtomGlyph from 'lucide-react-native/icons/atom';
import AudioLinesGlyph from 'lucide-react-native/icons/audio-lines';
import AwardGlyph from 'lucide-react-native/icons/award';
import BadgeCheckGlyph from 'lucide-react-native/icons/badge-check';
import BellGlyph from 'lucide-react-native/icons/bell';
import BoldGlyph from 'lucide-react-native/icons/bold';
import BookOpenGlyph from 'lucide-react-native/icons/book-open';
import BookmarkGlyph from 'lucide-react-native/icons/bookmark';
import BriefcaseBusinessGlyph from 'lucide-react-native/icons/briefcase-business';
import BuildingGlyph from 'lucide-react-native/icons/building';
import Building2Glyph from 'lucide-react-native/icons/building-complex';
import CalculatorGlyph from 'lucide-react-native/icons/calculator';
import CalendarGlyph from 'lucide-react-native/icons/calendar';
import CameraGlyph from 'lucide-react-native/icons/camera';
import CaptionsGlyph from 'lucide-react-native/icons/captions';
import ChartBarGlyph from 'lucide-react-native/icons/chart-bar';
import ChartColumnGlyph from 'lucide-react-native/icons/chart-column';
import CheckGlyph from 'lucide-react-native/icons/check';
import CheckCheckGlyph from 'lucide-react-native/icons/check-check';
import ChevronDownGlyph from 'lucide-react-native/icons/chevron-down';
import ChevronLeftGlyph from 'lucide-react-native/icons/chevron-left';
import ChevronRightGlyph from 'lucide-react-native/icons/chevron-right';
import CircleCheckGlyph from 'lucide-react-native/icons/circle-check';
import CircleDotGlyph from 'lucide-react-native/icons/circle-dot';
import CircleHelpGlyph from 'lucide-react-native/icons/circle-question-mark';
import CirclePlayGlyph from 'lucide-react-native/icons/circle-play';
import CircleUserGlyph from 'lucide-react-native/icons/circle-user';
import ClipboardListGlyph from 'lucide-react-native/icons/clipboard-list';
import ClockGlyph from 'lucide-react-native/icons/clock';
import CloudCheckGlyph from 'lucide-react-native/icons/cloud-check';
import CloudUploadGlyph from 'lucide-react-native/icons/cloud-upload';
import CodeGlyph from 'lucide-react-native/icons/code';
import CoffeeGlyph from 'lucide-react-native/icons/coffee';
import Columns2Glyph from 'lucide-react-native/icons/columns-2';
import CpuGlyph from 'lucide-react-native/icons/cpu';
import CrownGlyph from 'lucide-react-native/icons/crown';
import DatabaseGlyph from 'lucide-react-native/icons/database';
import DownloadGlyph from 'lucide-react-native/icons/download';
import EllipsisGlyph from 'lucide-react-native/icons/ellipsis';
import EyeGlyph from 'lucide-react-native/icons/eye';
import EyeOffGlyph from 'lucide-react-native/icons/eye-off';
import FileSearchGlyph from 'lucide-react-native/icons/file-search';
import FileTextGlyph from 'lucide-react-native/icons/file-text';
import FileUpGlyph from 'lucide-react-native/icons/file-up';
import FingerprintGlyph from 'lucide-react-native/icons/fingerprint-pattern';
import FlagGlyph from 'lucide-react-native/icons/flag';
import FlaskConicalGlyph from 'lucide-react-native/icons/flask-conical';
import FolderGlyph from 'lucide-react-native/icons/folder';
import GemGlyph from 'lucide-react-native/icons/gem';
import GiftGlyph from 'lucide-react-native/icons/gift';
import GlobeGlyph from 'lucide-react-native/icons/globe';
import GraduationCapGlyph from 'lucide-react-native/icons/graduation-cap';
import Grid3x3Glyph from 'lucide-react-native/icons/grid-3x3';
import HandGlyph from 'lucide-react-native/icons/hand';
import HeadsetGlyph from 'lucide-react-native/icons/headset';
import HeartGlyph from 'lucide-react-native/icons/heart';
import HouseGlyph from 'lucide-react-native/icons/house';
import ImageGlyph from 'lucide-react-native/icons/image';
import ImagesGlyph from 'lucide-react-native/icons/images';
import InfoGlyph from 'lucide-react-native/icons/info';
import ItalicGlyph from 'lucide-react-native/icons/italic';
import KeyRoundGlyph from 'lucide-react-native/icons/key-round';
import LandmarkGlyph from 'lucide-react-native/icons/landmark';
import LayersGlyph from 'lucide-react-native/icons/layers';
import LayoutGridGlyph from 'lucide-react-native/icons/layout-grid';
import LeafGlyph from 'lucide-react-native/icons/leaf';
import LibraryBigGlyph from 'lucide-react-native/icons/library-big';
import LightbulbGlyph from 'lucide-react-native/icons/lightbulb';
import LinkGlyph from 'lucide-react-native/icons/link';
import ListGlyph from 'lucide-react-native/icons/list';
import ListFilterGlyph from 'lucide-react-native/icons/list-filter';
import ListOrderedGlyph from 'lucide-react-native/icons/list-ordered';
import LockGlyph from 'lucide-react-native/icons/lock';
import LogOutGlyph from 'lucide-react-native/icons/log-out';
import MailGlyph from 'lucide-react-native/icons/mail';
import MapGlyph from 'lucide-react-native/icons/map';
import MapPinGlyph from 'lucide-react-native/icons/map-pin';
import Maximize2Glyph from 'lucide-react-native/icons/maximize-2';
import MegaphoneGlyph from 'lucide-react-native/icons/megaphone';
import MenuGlyph from 'lucide-react-native/icons/menu';
import MessagesSquareGlyph from 'lucide-react-native/icons/messages-square';
import MicGlyph from 'lucide-react-native/icons/mic';
import MicOffGlyph from 'lucide-react-native/icons/mic-off';
import MinusGlyph from 'lucide-react-native/icons/minus';
import MousePointerClickGlyph from 'lucide-react-native/icons/mouse-pointer-click';
import NotebookPenGlyph from 'lucide-react-native/icons/notebook-pen';
import PaperclipGlyph from 'lucide-react-native/icons/paperclip';
import PauseGlyph from 'lucide-react-native/icons/pause';
import PencilGlyph from 'lucide-react-native/icons/pencil';
import PercentGlyph from 'lucide-react-native/icons/percent';
import PhoneGlyph from 'lucide-react-native/icons/phone';
import PlayGlyph from 'lucide-react-native/icons/play';
import PlusGlyph from 'lucide-react-native/icons/plus';
import PresentationGlyph from 'lucide-react-native/icons/presentation';
import QrCodeGlyph from 'lucide-react-native/icons/qr-code';
import RadioGlyph from 'lucide-react-native/icons/radio';
import ReceiptGlyph from 'lucide-react-native/icons/receipt';
import Redo2Glyph from 'lucide-react-native/icons/redo-2';
import RefreshCwGlyph from 'lucide-react-native/icons/refresh-cw';
import RocketGlyph from 'lucide-react-native/icons/rocket';
import RotateCcwGlyph from 'lucide-react-native/icons/rotate-ccw';
import ScaleGlyph from 'lucide-react-native/icons/scale';
import ScanTextGlyph from 'lucide-react-native/icons/scan-text';
import ScreenShareGlyph from 'lucide-react-native/icons/screen-share';
import SearchGlyph from 'lucide-react-native/icons/search';
import SendGlyph from 'lucide-react-native/icons/send';
import ServerGlyph from 'lucide-react-native/icons/server';
import SettingsGlyph from 'lucide-react-native/icons/settings';
import ShareGlyph from 'lucide-react-native/icons/share';
import ShieldCheckGlyph from 'lucide-react-native/icons/shield-check';
import ShoppingCartGlyph from 'lucide-react-native/icons/shopping-cart';
import SigmaGlyph from 'lucide-react-native/icons/sigma';
import SmileGlyph from 'lucide-react-native/icons/face-slightly-smiling';
import SparklesGlyph from 'lucide-react-native/icons/sparkles';
import SquareGlyph from 'lucide-react-native/icons/square';
import StarGlyph from 'lucide-react-native/icons/star';
import TargetGlyph from 'lucide-react-native/icons/target';
import ThumbsDownGlyph from 'lucide-react-native/icons/thumbs-down';
import ThumbsUpGlyph from 'lucide-react-native/icons/thumbs-up';
import TicketGlyph from 'lucide-react-native/icons/ticket';
import TimerGlyph from 'lucide-react-native/icons/timer';
import Trash2Glyph from 'lucide-react-native/icons/trash';
import TriangleAlertGlyph from 'lucide-react-native/icons/triangle-alert';
import TrophyGlyph from 'lucide-react-native/icons/trophy';
import UnderlineGlyph from 'lucide-react-native/icons/underline';
import Undo2Glyph from 'lucide-react-native/icons/undo-2';
import UserPlusGlyph from 'lucide-react-native/icons/user-plus';
import UsersGlyph from 'lucide-react-native/icons/users';
import VideoGlyph from 'lucide-react-native/icons/video';
import VideoOffGlyph from 'lucide-react-native/icons/video-off';
import Volume2Glyph from 'lucide-react-native/icons/volume-2';
import VolumeXGlyph from 'lucide-react-native/icons/volume-x';
import WalletGlyph from 'lucide-react-native/icons/wallet';
import XGlyph from 'lucide-react-native/icons/x';
import ZapGlyph from 'lucide-react-native/icons/zap';
import type { LucideIcon } from 'lucide-react-native';

import { IconStroke } from '@/constants/maple';
import type { IconName } from '@/lib/icons';

/**
 * Every Maple interface icon is a Lucide vector: the same outline style and
 * stroke on iOS, Android and the web. A name in lib/icons.ts maps to one glyph
 * here; `filled` glyphs (play, pause, a saved bookmark) are solid.
 */
const GLYPHS: Readonly<Record<IconName, { glyph: LucideIcon; filled?: boolean }>> = {
  home: { glyph: HouseGlyph },
  play: { glyph: CirclePlayGlyph },
  library: { glyph: LibraryBigGlyph },
  map: { glyph: MapGlyph },
  wallet: { glyph: WalletGlyph },
  school: { glyph: LandmarkGlyph },
  chart: { glyph: ChartColumnGlyph },
  people: { glyph: UsersGlyph },
  person: { glyph: CircleUserGlyph },
  calendar: { glyph: CalendarGlyph },
  clipboard: { glyph: ClipboardListGlyph },
  check: { glyph: CircleCheckGlyph },
  alert: { glyph: TriangleAlertGlyph },
  info: { glyph: InfoGlyph },
  bell: { glyph: BellGlyph },
  search: { glyph: SearchGlyph },
  plus: { glyph: PlusGlyph },
  chevronRight: { glyph: ChevronRightGlyph },
  chevronLeft: { glyph: ChevronLeftGlyph },
  chevronDown: { glyph: ChevronDownGlyph },
  swap: { glyph: ArrowLeftRightGlyph },
  logout: { glyph: LogOutGlyph },
  sparkle: { glyph: SparklesGlyph },
  cloud: { glyph: CloudCheckGlyph },
  live: { glyph: RadioGlyph },
  book: { glyph: BookOpenGlyph },
  flag: { glyph: FlagGlyph },
  chat: { glyph: MessagesSquareGlyph },
  more: { glyph: EllipsisGlyph },
  qr: { glyph: QrCodeGlyph },
  mic: { glyph: MicGlyph },
  camera: { glyph: CameraGlyph },
  download: { glyph: DownloadGlyph },
  lock: { glyph: LockGlyph },
  eye: { glyph: EyeGlyph },
  eyeOff: { glyph: EyeOffGlyph },
  star: { glyph: StarGlyph },
  globe: { glyph: GlobeGlyph },
  hand: { glyph: HandGlyph },
  clock: { glyph: ClockGlyph },
  arrowRight: { glyph: ArrowRightGlyph },
  trophy: { glyph: TrophyGlyph },
  share: { glyph: ShareGlyph },
  heart: { glyph: HeartGlyph },
  cart: { glyph: ShoppingCartGlyph },
  list: { glyph: ListGlyph },
  minus: { glyph: MinusGlyph },
  menu: { glyph: MenuGlyph },
  cap: { glyph: GraduationCapGlyph },
  mail: { glyph: MailGlyph },
  phone: { glyph: PhoneGlyph },
  fingerprint: { glyph: FingerprintGlyph },
  shield: { glyph: ShieldCheckGlyph },
  expand: { glyph: Maximize2Glyph },
  thumbUp: { glyph: ThumbsUpGlyph },
  thumbDown: { glyph: ThumbsDownGlyph },
  grid: { glyph: LayoutGridGlyph },
  settings: { glyph: SettingsGlyph },
  micOff: { glyph: MicOffGlyph },
  video: { glyph: VideoGlyph },
  videoOff: { glyph: VideoOffGlyph },
  screen: { glyph: ScreenShareGlyph },
  smile: { glyph: SmileGlyph },
  notes: { glyph: NotebookPenGlyph },
  transcript: { glyph: AlignLeftGlyph },
  folder: { glyph: FolderGlyph },
  poll: { glyph: ChartBarGlyph },
  rooms: { glyph: Grid3x3Glyph },
  record: { glyph: CircleDotGlyph },
  help: { glyph: CircleHelpGlyph },
  send: { glyph: SendGlyph },
  close: { glyph: XGlyph },
  playFill: { glyph: PlayGlyph, filled: true },
  pause: { glyph: PauseGlyph, filled: true },
  volume: { glyph: Volume2Glyph },
  volumeOff: { glyph: VolumeXGlyph },
  captions: { glyph: CaptionsGlyph },
  timer: { glyph: TimerGlyph },
  bookmark: { glyph: BookmarkGlyph },
  bookmarkOn: { glyph: BookmarkGlyph, filled: true },
  undo: { glyph: Undo2Glyph },
  redo: { glyph: Redo2Glyph },
  bold: { glyph: BoldGlyph },
  italic: { glyph: ItalicGlyph },
  underline: { glyph: UnderlineGlyph },
  listBullet: { glyph: ListGlyph },
  listNumber: { glyph: ListOrderedGlyph },
  link: { glyph: LinkGlyph },
  sigma: { glyph: SigmaGlyph },
  columns: { glyph: Columns2Glyph },
  code: { glyph: CodeGlyph },
  upload: { glyph: FileUpGlyph },
  gallery: { glyph: ImagesGlyph },
  scan: { glyph: ScanTextGlyph },
  bolt: { glyph: ZapGlyph, filled: true },
  stop: { glyph: SquareGlyph, filled: true },
  trash: { glyph: Trash2Glyph },
  edit: { glyph: PencilGlyph },
  arrowLeft: { glyph: ArrowLeftGlyph },
  coffee: { glyph: CoffeeGlyph },
  sync: { glyph: RefreshCwGlyph },
  megaphone: { glyph: MegaphoneGlyph },
  paperclip: { glyph: PaperclipGlyph },
  filter: { glyph: ListFilterGlyph },
  flask: { glyph: FlaskConicalGlyph },
  calculator: { glyph: CalculatorGlyph },
  campus: { glyph: Building2Glyph },
  doneAll: { glyph: CheckCheckGlyph },
  image: { glyph: ImageGlyph },
  doc: { glyph: FileTextGlyph },
  pin: { glyph: MapPinGlyph },
  waveform: { glyph: AudioLinesGlyph },
  inPerson: { glyph: PresentationGlyph },
  userPlus: { glyph: UserPlusGlyph },
  cloudUpload: { glyph: CloudUploadGlyph },
  database: { glyph: DatabaseGlyph },
  layers: { glyph: LayersGlyph },
  percent: { glyph: PercentGlyph },
  key: { glyph: KeyRoundGlyph },
  server: { glyph: ServerGlyph },
  building: { glyph: BuildingGlyph },
  ticket: { glyph: TicketGlyph },
  headset: { glyph: HeadsetGlyph },
  verified: { glyph: BadgeCheckGlyph },
  cpu: { glyph: CpuGlyph },
  pulse: { glyph: ActivityGlyph },
  balance: { glyph: ScaleGlyph },
  receipt: { glyph: ReceiptGlyph },
  inspect: { glyph: FileSearchGlyph },
  arrowUp: { glyph: ArrowUpGlyph },
  arrowDown: { glyph: ArrowDownGlyph },
  diamond: { glyph: GemGlyph },
  tick: { glyph: CheckGlyph },
  target: { glyph: TargetGlyph },
  atom: { glyph: AtomGlyph },
  leaf: { glyph: LeafGlyph },
  bulb: { glyph: LightbulbGlyph },
  restart: { glyph: RotateCcwGlyph },
  crown: { glyph: CrownGlyph },
  rocket: { glyph: RocketGlyph },
  gift: { glyph: GiftGlyph },
  heartFill: { glyph: HeartGlyph, filled: true },
  briefcase: { glyph: BriefcaseBusinessGlyph },
  award: { glyph: AwardGlyph },
  pointer: { glyph: MousePointerClickGlyph },
  sealCheck: { glyph: BadgeCheckGlyph, filled: true },
};

interface IconProps {
  name: IconName;
  /** 16 inline, 20 standard (default), 24 section, 28-32 feature. */
  size?: number;
  color: ColorValue;
  /** Overrides the standard 1.85 stroke, e.g. thinner for large feature icons. */
  strokeWidth?: number;
}

/** Hides the icon from screen readers: an SVG attribute on the web, native props on phones. */
const HIDDEN = Platform.OS === 'web' ? { 'aria-hidden': true } : { accessible: false, importantForAccessibility: 'no-hide-descendants' as const };

/** A decorative icon. Pair it with text: it is hidden from screen readers. */
export function Icon({ name, size = 20, color, strokeWidth = IconStroke }: IconProps) {
  const { glyph: Glyph, filled = false } = GLYPHS[name];
  return (
    <Glyph
      size={size}
      color={color as string}
      fill={filled ? (color as string) : 'none'}
      strokeWidth={strokeWidth}
      {...HIDDEN}
    />
  );
}
