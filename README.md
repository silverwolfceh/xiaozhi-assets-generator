# 小智 AI 自定义 Assets 单页应用

## 应用目的

小智AI语音对话盒子的自定义主题（包括唤醒词模型、表情包、文本字体、聊天背景），在线生成和导出 assets.bin 文件。

## 功能设计

用户要自定义一个 assets.bin 文件，分为 3 个步骤。
- Step 1：选择芯片型号，屏幕类型与分辨率
- Step 2：主题设计（使用多个tab来分别完成不同项目的配置）
- Step 3：待打包生成的内容清单以及生成按钮

## 详细页面功能

### 选择芯片型号，屏幕类型与分辨率

给出一些常见的板子的快捷选择配置项，例如

- 立创·实战派 ESP32-S3，配置为 esp32s3，LCD 320x240，RGB565
- ESP-BOX-3，配置为 esp32s3，LCD 320x240，RGB565
- 无名科技·星智 1.54 TFT，配置为 esp32s3，LCD 240x240，RGB565
- Surfer C3 1.14 TFT，配置为 esp32c3，LCD 240x135，RGB565

也可以自定义芯片（可以选择 esp32s3,esp32c3,esp32p4,esp32c6），自定义分辨率大小，颜色目前只支持 16位的RGB565

### 主题设计

#### Tab 1: 唤醒词配置

对于 C3/C6 芯片，只支持 WakeNet9s 的唤醒词模型。
对于 S3/P4 芯片，只支持 WakeNet9 的唤醒词模型。

列表如下，第一列为唤醒词名称，其他列为值。

|wake words       |             WakeNet9s           |  WakeNet9              | 
|:--------------- | :------------------------------:| :---------------------:| 
|Hi,乐鑫           |  wn9s_hilexin                   | wn9_hilexin            | 
|Hi,ESP           |  wn9s_hiesp                      | wn9_hiesp              | 
|你好小智          |  wn9s_nihaoxiaozhi              | wn9_nihaoxiaozhi_tts   |
|Hi,Jason         |   wn9s_hijason_tts2              | wn9_hijason_tts2       |
|你好喵伴          |                                 | wn9_nihaomiaoban_tts2   |
|小爱同学          |                                 | wn9_xiaoaitongxue      | 
|Hi,M Five        |                                  | wn9_himfive            | 
|Alexa            |                                  | wn9_alexa              | 
|Jarvis           |                                  | wn9_jarvis_tts         | 
|Computer         |                                  | wn9_computer_tts       |
|Hey,Willow       |                                  | wn9_heywillow_tts      | 
|Sophia           |                                  | wn9_sophia_tts         |
|Mycroft          |                                  | wn9_mycroft_tts        |
|Hey,Printer      |                                  | wn9_heyprinter_tts     |
|Hi,Joy           |                                  | wn9_hijoy_tts          |
|Hey,Wand         |                                  | wn9_heywanda_tts       |
|Astrolabe        |                                  | wn9_astrolabe_tts      |
|Hey,Ily          |                                  | wn9_heyily_tts2        |
|Hi,Jolly         |                                  | wn9_hijolly_tts2        |
|Hi,Fairy         |                                  | wn9_hifairy_tts2        |
|Blue Chip        |                                  | wn9_bluechip_tts2        |
|Hi,Andy          |                                  | wn9_hiandy_tts2        |
|Hi,Wall E/Hi,瓦力|                                  | wn9_hiwalle_tts2       |
|你好小鑫         |                                  | wn9_nihaoxiaoxin_tts   |
|小美同学         |                                  | wn9_xiaomeitongxue_tts |
|Hi,小星          |                                  | wn9_hixiaoxing_tts     |
|小龙小龙         |                                  | wn9_xiaolongxiaolong_tts    |
|喵喵同学         |                                  | wn9_miaomiaotongxue_tts|
|Hi,喵喵          |                                  | wn9_himiaomiao_tts     |
|Hi,Lily/Hi,莉莉  |                                  | wn9_hilili_tts         |
|Hi,Telly/Hi,泰力 |                                  | wn9_hitelly_tts        |
|小滨小滨/小冰小冰|                                  | wn9_xiaobinxiaobin_tts |
|Hi,小巫          |                                  | wn9_haixiaowu_tts      |
|小鸭小鸭         |                                  | wn9_xiaoyaxiaoya_tts2  |
|璃奈板           |                                  | wn9_linaiban_tts2      |
|小酥肉           |                                  | wn9_xiaosurou_tts2      |
|小宇同学         |                                  | wn9_xiaoyutongxue_tts2  |
|小明同学         |                                  | wn9_xiaomingtongxue_tts2|
|小康同学         |                                  | wn9_xiaokangtongxue_tts2|
|小箭小箭         |                                  | wn9_xiaojianxiaojian_tts2|
|小特小特         |                                  | wn9_xiaotexiaote_tts2|
|你好小益         |                                  | wn9_nihaoxiaoyi_tts2|
|你好百应         |                                  | wn9_nihaobaiying_tts2|
|小鹿小鹿         |                                  | wn9_xiaoluxiaolu_tts2|
|你好东东         |                                  | wn9_nihaodongdong_tts2|
|你好小安         |                                  | wn9_nihaoxiaoan_tts2|
|你好小脉         |                                  | wn9_ni3hao3xiao3mai4_tts2|

唤醒词参考 `spiffs_assets/pack_model.py` 把 `share/wakenet_model` 下对应的模型目录打包成 srmodels.bin

#### Tab 2：字体配置

用户可以选择预设字体（位于 `share/fonts` 目录），无需字体制作过程，常用字体有：
- font_puhui_14_1：阿里巴巴普惠体，涵盖常用字7000个，字号14px，bpp1
- font_puhui_16_4：阿里巴巴普惠体，涵盖常用字7000个，字号16px，bpp4
- font_puhui_20_4：阿里巴巴普惠体，涵盖常用字7000个，字号20px，bpp4
- font_puhui_30_4：阿里巴巴普惠体，涵盖常用字7000个，字号30px，bpp4

用户也可以上传自定义字体：
- 需要选择本地字体文件，目前支持TTF与WOFF格式。
- 选择字号（范围限制在8-80之间，常用为14,16,20和30），选择bpp（范围为1，2，4）
- 选择字符集（GB2312 7445个字符、DeepSeek R1 7405个字符），默认选择 DeepSeek R1

自定义字体参考 `lv_font_conv/lib/convert.js` 转换成 cbin 格式，转换后的文件命名为 font_[字体名]_[字号]_[BPP].bin

### Tab 3：表情集合

一个常见的表情集合一共包含 21 张图片，其中一张为 neutral 默认表情，其余为表达不同情绪的表情。
不同表情对应的 Emoji 如下：

| 😶 | neutral      |
| 🙂 | happy        |
| 😆 | laughing     |
| 😂 | funny        |
| 😔 | sad          |
| 😠 | angry        |
| 😭 | crying       |
| 😍 | loving       |
| 😳 | embarrassed  |
| 😯 | surprised    |
| 😱 | shocked      |
| 🤔 | thinking     |
| 😉 | winking      |
| 😎 | cool         |
| 😌 | relaxed      |
| 🤤 | delicious    |
| 😘 | kissy        |
| 😏 | confident    |
| 😴 | sleepy       |
| 😜 | silly        |
| 🙄 | confused     |

用户可以选择预设表情包，预设表情有：
- Twemoji 32x32 PNG (位于 `share/twemoji32`)
- Twemoji 64x64 PNG (位于 `share/twemoji64`)

用户也可以自定义表情包：
- 需要设置一个统一的图片大小 width x height，不能大于屏幕分辨率。
- 选择动态图片（GIF）或静态透明背景图片（PNG）格式
- 必须要提供一张默认图片作为 neutral 表情（大小会自动适配为 widght x height）
- 其他表情为可选，如果用户不修改其他表情图片，则默认使用 neutral 表情来显示。

### Tab 4：聊天背景

背景分为浅色模式和深色模式两种配置，默认为颜色配置
- 默认浅色模式为 #ffffff，深色模式为 #121212

用户可以修改默认颜色，也可以加入静态图片作为背景。
静态图片可以为两张不一样的图片，也可以配置为一张图。
背景图片会自动适配屏幕分辨率的大小，格式通常为RGB565的位图，带64字节的header，内容为lv_image_dsc_t。

### 生成 assets.bin

用户在主题设计的过程中，可以随时点击右上角的生成按钮，通过弹窗的方式，显示要打包的资源清单。
用户点击“确定”后，开始等待生成，如果用户自定义了字体文件，则制作字体需要的时间会比较长，制作结果可以缓存起来，重新生成的时候速度更快。

现在已经实现了浏览器端本地生成 assets.bin 的功能，无需后端 API。

## 技术实现

### 浏览器端生成 assets.bin

项目现在使用完全基于浏览器的本地生成方案：

1. **WakenetModelPacker.js** - 模仿 `pack_model.py` 的功能，在浏览器端打包唤醒词模型为 srmodels.bin
2. **SpiffsGenerator.js** - 模仿 `spiffs_assets_gen.py` 的功能，生成最终的 assets.bin 文件
3. **AssetsBuilder.js** - 协调各个模块，模仿 `build.py` 的资源处理流程

### 生成流程

1. 加载用户配置
2. 处理字体文件（预设字体或自定义字体转换）
3. 从 `share/wakenet_model/` 加载并打包唤醒词模型
4. 处理表情图片（预设或自定义）
5. 处理背景图片并转换为RGB565格式
6. 生成 index.json 索引文件
7. 使用 SPIFFS 格式打包所有文件为 assets.bin

### 资源文件结构

生成的 assets.bin 包含索引文件 index.json，内容大概如下：

例子1：
```json
{
    "version": 1,
    "chip_model": "esp32s3",
    "display_config": {
        "width": 320,
        "height": 240,
        "monochrome": false,
        "color": "RGB565"
    },
    "srmodels": "srmodels.bin",
    "text_font": "font_puhui_common_30_4.bin",
    "skin": {
        "light": {
            "text_color": "#000000",
            "background_color": "#FFFFFF",
            "background_image": "background_light.raw"
        },
        "dark": {
            "text_color": "#FFFFFF",
            "background_color": "#121212",
            "background_image": "background_dark.raw"
        }
    },
    "emoji_collection": [
        {
            "name": "sleepy",
            "file": "sleepy.png"
        },
        ...
    ]
}
```

例子2：
```json
{
    "version": 1,
    "chip_model": "esp32c3",
    "display_config": {
        "width": 240,
        "height": 240,
        "monochrome": false,
        "color": "RGB565"
    },
    "srmodels": "srmodels.bin",
    "text_font": "font_puhui_common_16_4.bin",
    "skin": {
        "light": {
            "text_color": "#000000",
            "background_color": "#FFFFFF",
        },
        "dark": {
            "text_color": "#FFFFFF",
            "background_color": "#121212"
        }
    },
    "emoji_collection": [
        {
            "name": "sleepy",
            "file": "sleepy.png"
        },
        ...
    ]
}
```

