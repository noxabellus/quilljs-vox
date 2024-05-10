import Quill, { Range } from "quill/core/quill";

import { AlignStyle } from "quill/formats/align";
import { DirectionStyle } from "quill/formats/direction";
import Indent from "quill/formats/indent";

import Blockquote from "quill/formats/blockquote";
import Header from "quill/formats/header";
import List from "quill/formats/list";


import Bold from "quill/formats/bold";
import Italic from "quill/formats/italic";
import Link from "quill/formats/link";
import Script from "quill/formats/script";
import Strike from "quill/formats/strike";
import Underline from "quill/formats/underline";

import Block, { BlockEmbed } from "quill/blots/block";
import Break from "quill/blots/break";
import Container from "quill/blots/container";
import Cursor from "quill/blots/cursor";
import Embed from "quill/blots/embed";
import Inline from "quill/blots/inline";
import Scroll from "quill/blots/scroll";
import TextBlot from "quill/blots/text";

import History from "quill/modules/history";
import Uploader from "quill/modules/uploader";
import Input from "quill/modules/input";
import UINode from "quill/modules/uiNode";

import FontStyle from "./font";
import SizeStyle from "./size";
import ColorStyle from "./color";
import BackgroundStyle from "./background";
import Image from "./image";
import Keyboard from "./keyboard";
import Clipboard from "./clipboard";
import Delta, { AttributeMap, Op } from "quill-delta";

Quill.register({
    "blots/block": Block,
    "blots/block/embed": BlockEmbed,
    "blots/break": Break,
    "blots/container": Container,
    "blots/cursor": Cursor,
    "blots/embed": Embed,
    "blots/inline": Inline,
    "blots/scroll": Scroll,
    "blots/text": TextBlot,

    "modules/history": History,
    "modules/uploader": Uploader,
    "modules/input": Input,
    "modules/uiNode": UINode,
    "modules/clipboard": Clipboard,
    "modules/keyboard": Keyboard,

    "attributors/style/align": AlignStyle,
    "attributors/style/background": BackgroundStyle,
    "attributors/style/color": ColorStyle,
    "attributors/style/direction": DirectionStyle,
    "attributors/style/font": FontStyle,
    "attributors/style/size": SizeStyle,

    "formats/align": AlignStyle,
    "formats/direction": DirectionStyle,
    "formats/indent": Indent,
    "formats/image": Image,

    "formats/background": BackgroundStyle,
    "formats/color": ColorStyle,
    "formats/font": FontStyle,
    "formats/size": SizeStyle,

    "formats/blockquote": Blockquote,
    "formats/header": Header,
    "formats/list": List,

    "formats/bold": Bold,
    "formats/italic": Italic,
    "formats/link": Link,
    "formats/script": Script,
    "formats/strike": Strike,
    "formats/underline": Underline,
});

export {Quill as default, Delta, Op, Range, AttributeMap};
