export interface PolicySection {
  id: string;
  zhTitle: string;
  enTitle: string;
  zhIntro?: string;
  enIntro?: string;
  warning?: { zh: string; en: string };
  items: {
    titleZh: string;
    titleEn: string;
    textZh?: string;
    textEn?: string;
    listZh?: string[];
    listEn?: string[];
    tag?: { type: 'ok' | 'no' | 'warning'; zh: string; en: string };
  }[];
}

export const POLICIES: PolicySection[] = [
  {
    id: 'shopping',
    zhTitle: '购物须知',
    enTitle: 'Shopping Guide',
    items: [
      {
        titleZh: '下单前须知',
        titleEn: 'Before ordering',
        textZh: '请在下单前仔细阅读商品描述、尺寸表及面料说明，确认符合您的需求。一旦下单即表示您已阅读并同意本店所有政策。',
        textEn: 'Please read the product description, size chart and fabric notes carefully before placing an order. By ordering, you agree to Cippy Malaysia\'s store policies.'
      },
      {
        titleZh: '商品颜色说明',
        titleEn: 'Colour difference',
        textZh: '由于屏幕色彩差异，实物颜色可能与图片存在轻微色差，属正常现象，不属于质量问题。如需参考实色，可联系客服索取更多照片。',
        textEn: 'Product colours may appear slightly different due to screen settings and lighting. Minor colour difference is normal and is not considered a defect. You may contact us for more photos before ordering.'
      },
      {
        titleZh: '尺寸说明',
        titleEn: 'Sizing',
        textZh: '每件商品均附有尺寸表，为人工实际测量，可能存在 1–3cm 误差。建议参考尺寸表和模特数据后再下单，如拿不准请联系客服。',
        textEn: 'All measurements are taken manually and may have a 1-3cm difference. Please compare the size chart and model details before choosing a size.'
      },
      {
        titleZh: '面料说明',
        titleEn: 'Fabric notes',
        textZh: '商品页面列明面料成分，如需了解手感、垂坠度、弹性等更多细节，欢迎联系客服咨询。',
        textEn: 'Fabric information is listed on product pages where available. For feel, stretch, thickness or lining details, please contact us before checkout.'
      },
      {
        titleZh: '人工测量误差',
        titleEn: 'Manual measurement',
        textZh: '所有尺寸均为手工平铺测量，允许 ±1–3cm 误差，此误差属正常范围，不接受以此理由申请退换货。',
        textEn: 'A 1-3cm measurement difference is considered normal and cannot be used as a return or exchange reason.'
      },
      {
        titleZh: '库存说明',
        titleEn: 'Stock availability',
        textZh: '商品库存实时更新。如下单后商品售罄，我们会第一时间联系您协商（补货或退款）。建议心仪商品尽早下单。',
        textEn: 'Stock is updated as accurately as possible. If an item is sold out after checkout, we will contact you to arrange restock waiting or refund.'
      },
      {
        titleZh: '下单后是否可取消',
        titleEn: 'Order cancellation',
        textZh: '未付款订单可随时取消。已付款订单若尚未开始包装，可联系客服申请取消。已开始包装或已发货的订单不接受取消。',
        textEn: 'Unpaid orders can be cancelled anytime. Paid orders can only be cancelled before packing starts. Once packed or shipped, cancellation is not accepted.'
      },
      {
        titleZh: '订单修改说明',
        titleEn: 'Order changes',
        textZh: '订单提交后如需修改（地址、尺寸、颜色），请在付款后 2 小时内 联系客服。包装完成后将无法修改。',
        textEn: 'Please contact us within 2 hours after payment if you need to change address, size or colour. Changes cannot be made after packing begins.'
      }
    ]
  },
  {
    id: 'shipping',
    zhTitle: '配送政策',
    enTitle: 'Shipping Policy',
    items: [
      {
        titleZh: '发货时间',
        titleEn: 'Processing time',
        textZh: '付款确认后，我们将在 1–3 个工作日 内完成包装并交付快递。如遇节日假期或大促期间，时间可能延长，我们会提前公告。',
        textEn: 'Ready-stock orders are packed and handed to courier within 1-3 working days after payment confirmation.'
      },
      {
        titleZh: '预购商品时间',
        titleEn: 'Pre-order timing',
        textZh: '预购商品的预计发货时间在商品页面注明，通常为下单后 7–21 个工作日，以商品页面为准。',
        textEn: 'Pre-order items follow the estimated shipping period shown on the product page, usually 7-21 working days.'
      },
      {
        titleZh: '现货商品时间',
        titleEn: 'Ready-stock item timing',
        textZh: '现货商品付款确认后 1–3 个工作日内发货。',
        textEn: 'Ready-stock items are shipped within 1-3 working days after payment confirmation.'
      },
      {
        titleZh: '节日期间说明',
        titleEn: 'Holiday delays',
        textZh: '农历新年、开斋节、圣诞节等主要节假日前后，发货时间可能延长 3–7 天。我们会在节日前于社媒及邮件提前告知。',
        textEn: 'During festive seasons or major sale periods, processing may take 3-7 extra days. We will announce important delays where possible.'
      },
      {
        titleZh: 'Courier 公司',
        titleEn: 'Courier',
        textZh: '本店使用 DHL Express 配送，确保快速安全到达。',
        textEn: 'We use DHL Express for delivery where available.'
      },
      {
        titleZh: '运费计算',
        titleEn: 'Shipping fees',
        textZh: '运费在结账时自动计算。配送政策标准：',
        textEn: 'Shipping is calculated automatically at checkout. Delivery standards:',
        listZh: [
          '西马：RM 10',
          '东马（沙巴/砂拉越）：RM 15',
          '新加坡：RM 30'
        ],
        listEn: [
          'West Malaysia: RM 10',
          'East Malaysia, Sabah/Sarawak: RM 15',
          'Singapore: RM 30'
        ]
      },
      {
        titleZh: '国际配送',
        titleEn: 'International shipping',
        textZh: '目前提供配送至 新加坡，运费 RM 30。如需其他国际配送，请联系客服咨询。',
        textEn: 'We currently ship to Singapore. For other countries, please contact us before ordering.'
      },
      {
        titleZh: '包裹遗失处理',
        titleEn: 'Lost parcel',
        textZh: '如快递追踪显示包裹遗失，请第一时间联系我们，我们将协助向快递公司提出索赔，处理时间约 7–14 个工作日。',
        textEn: 'If tracking shows that a parcel is lost, contact us immediately. We will help raise a claim with the courier. Investigation usually takes 7-14 working days.'
      },
      {
        titleZh: '包裹延误说明',
        titleEn: 'Courier delays',
        textZh: '如遇恶劣天气、节假日或快递异常导致延误，我们无法对快递时效作出保证，但会尽力协助跟进。',
        textEn: 'Weather, holidays and courier disruptions may cause delays. We will assist with follow-up but cannot guarantee courier delivery speed.'
      },
      {
        titleZh: '地址填写错误',
        titleEn: 'Wrong address',
        textZh: '因买家填写地址错误导致包裹无法送达，重新投递费用由买家承担。请在下单前仔细核对收件地址。',
        textEn: 'If the address entered by the customer is incorrect, re-delivery or return shipping costs will be borne by the customer.'
      }
    ]
  },
  {
    id: 'returns',
    zhTitle: '退换货政策',
    enTitle: 'Return & Exchange Policy',
    items: [
      {
        titleZh: '哪些情况可以申请',
        titleEn: 'Accepted reasons',
        tag: { type: 'ok', zh: '可申请', en: 'Accepted' },
        listZh: [
          '收到商品与描述严重不符',
          '商品存在明显制造缺陷（非正常误差）',
          '收到错误商品（款式/颜色/尺码与下单不符）',
          '提供完整未剪辑开箱视频'
        ],
        listEn: [
          'Item is significantly different from the description',
          'Clear manufacturing defect',
          'Wrong item, colour or size was sent',
          'Complete unedited unboxing video is provided'
        ]
      },
      {
        titleZh: '哪些情况不能申请',
        titleEn: 'Not accepted',
        tag: { type: 'no', zh: '不接受', en: 'Not accepted' },
        listZh: [
          '不喜欢颜色或款式（主观原因）',
          '尺寸误差在 1–3cm 范围内',
          '轻微色差（属正常颜色显示差异）',
          '商品已穿着、洗涤或去除吊牌',
          '无完整开箱视频',
          '特卖/Sale 商品',
          '配饰类商品（耳环、项链等）'
        ],
        listEn: [
          'Change of mind, colour or style preference',
          '1-3cm measurement difference',
          'Minor colour difference caused by lighting or screen settings',
          'Item has been worn, washed, scented or tag removed',
          'No complete unboxing video',
          'Sale items',
          'Accessories such as earrings and necklaces'
        ]
      },
      {
        titleZh: '申请期限',
        titleEn: 'Request period',
        textZh: '请在收货后 3天内 联系客服提出申请，逾期恕不受理。',
        textEn: 'Please contact us within 3 days after receiving your parcel. Late requests cannot be accepted.'
      },
      {
        titleZh: '换货流程',
        titleEn: 'Exchange process',
        listZh: [
          'WhatsApp 客服说明情况，附上开箱视频及商品照片',
          '客服审核后告知是否批准换货',
          '将商品寄回指定地址（附快递单号）',
          '我们收到并检查商品后，安排寄出换货商品'
        ],
        listEn: [
          'WhatsApp us with your order number, photos and unboxing video',
          'We review the request and confirm eligibility',
          'Return the item to the given address with tracking',
          'After inspection, we arrange the approved exchange'
        ]
      },
      {
        titleZh: '换货次数',
        titleEn: 'Exchange limit',
        textZh: '每笔订单最多申请换货 1次。',
        textEn: 'Each order can request exchange once only.'
      },
      {
        titleZh: '运费承担',
        titleEn: 'Shipping cost',
        textZh: '若属本店责任（错货/质量问题），来回运费由本店承担。若属买家原因，退货运费由买家承担，换货寄出运费本店承担。',
        textEn: 'If the issue is caused by us, we cover return and replacement shipping. If caused by customer reason, return shipping is borne by the customer.'
      },
      {
        titleZh: '商品检查标准',
        titleEn: 'Returned item condition',
        textZh: '退回商品须保持全新未穿着状态，附原吊牌，无气味、无污渍。检查不合格将原件寄回，不予退换。',
        textEn: 'Items must be brand new, unworn, unwashed, with tag attached, free from stain, scent and damage. Failed inspection items will be returned to the customer.'
      },
      {
        titleZh: '二次销售标准',
        titleEn: 'Resale condition standard',
        textZh: '退回商品经检查符合全新标准后，方可接受退换。商品如有任何使用痕迹，将不接受退换。',
        textEn: 'Returned items must pass inspection and remain in brand-new resale condition. Any item with signs of use will not be accepted for return or exchange.'
      }
    ]
  },
  {
    id: 'refund',
    zhTitle: '退款政策',
    enTitle: 'Refund Policy',
    items: [
      {
        titleZh: '哪些情况可以退款',
        titleEn: 'Refundable cases',
        tag: { type: 'ok', zh: '可退款', en: 'Refundable' },
        listZh: [
          '商品存在明显质量问题且无法换货',
          '缺货且顾客不接受等待',
          '错发商品且顾客不接受换货（须将商品寄回，经确认可二次销售后方可退款）'
        ],
        listEn: [
          'Approved defect case where replacement is unavailable',
          'Item is out of stock and customer does not wish to wait',
          'Wrong item was sent and customer does not accept exchange, subject to return inspection'
        ]
      },
      {
        titleZh: '退款方式',
        titleEn: 'Refund method',
        textZh: '退款将原路退回：信用卡退回原卡、DuitNow/FPX 退回原银行账户。',
        textEn: 'Refunds are returned to the original payment method where possible, such as card, FPX or bank account.'
      },
      {
        titleZh: '退款时间',
        titleEn: 'Processing time',
        textZh: '退款申请审核通过后，处理时间为 5–10 个工作日，到账时间视银行而定。',
        textEn: 'Approved refunds are processed within 5-10 working days. Actual bank posting time depends on the bank or payment provider.'
      },
      {
        titleZh: '退款金额',
        titleEn: 'Refund amount',
        textZh: '退款金额为实际支付商品金额，不包含已使用优惠折扣差额。',
        textEn: 'The refund amount is based on the actual amount paid for the item. Used discounts or voucher value are not refunded separately.'
      },
      {
        titleZh: '优惠券是否退回',
        titleEn: 'Voucher handling',
        textZh: '退款后，已使用的优惠券及折扣码不予退回，仅退回实付金额。',
        textEn: 'Used vouchers or discount codes will not be restored after refund.'
      },
      {
        titleZh: '运费是否退款',
        titleEn: 'Shipping fee',
        textZh: '若退款原因属本店责任，运费一并退回。若属顾客个人原因，运费不予退款。',
        textEn: 'Shipping is refunded only when the issue is caused by Cippy Malaysia. For customer reasons, shipping fees are not refundable.'
      },
      {
        titleZh: '无法退款情况',
        titleEn: 'Non-refundable cases',
        tag: { type: 'no', zh: '不接受', en: 'Not accepted' },
        listZh: [
          '商品已穿着使用',
          '特卖/Sale 商品',
          '无开箱视频证明',
          '超过申请期限（3天）'
        ],
        listEn: [
          'Item has been worn or washed',
          'Sale items',
          'No unboxing video proof',
          'Request is made after the 3-day period'
        ]
      }
    ]
  },
  {
    id: 'quality',
    zhTitle: '商品质量标准',
    enTitle: 'Quality Standards',
    items: [
      {
        titleZh: '以下情况不属于质量问题',
        titleEn: 'Not considered defects',
        listZh: [
          '少量线头：布料剪裁后的正常现象，可自行修剪。',
          '轻微褶皱：运输产生的正常折叠痕迹，熨烫后可消除。',
          '轻微色差：屏幕色彩设置及拍摄光线差异所致。',
          '印刷位置轻微偏差：手工印刷工艺，允许 ±0.5cm 位置偏差。',
          '1–3cm 尺寸误差：手工测量误差范围内，属正常情况。',
          '布料纹路不同：天然面料纹理各有差异，每件均为独特。',
          '染色批次不同：不同批次面料染色可能存在轻微色调差异。',
          '牛仔洗水不同：牛仔面料每批洗水效果略有差异。',
          '针织弹性差异：针织面料弹性因松紧度不同而存在差异。'
        ],
        listEn: [
          'Loose threads: Small loose threads from cutting and sewing can be trimmed.',
          'Minor wrinkles: Wrinkles from folding and delivery can be removed by steaming or ironing.',
          'Minor colour difference: Caused by lighting and screen display settings.',
          'Small print position difference: Manual print or embroidery placement may have slight differences.',
          '1-3cm size difference: Manual measurement differences are normal.',
          'Fabric texture variation: Some fabrics naturally have small texture differences.',
          'Dye batch variation: Different batches may have slightly different tones.',
          'Denim wash variation: Denim wash may vary by batch.',
          'Knit elasticity variation: Knit fabrics may have slight elasticity differences depending on tension and batch.'
        ]
      },
      {
        titleZh: '什么才算质量问题',
        titleEn: 'Accepted defect examples',
        tag: { type: 'ok', zh: '可申请退换', en: 'Eligible' },
        listZh: [
          '明显缝合断裂或开线（非边缘线头）',
          '拉链或扣子无法正常使用',
          '面料有明显破洞或损坏',
          '印花大面积脱落或错印'
        ],
        listEn: [
          'Major seam breakage',
          'Zip or button cannot be used',
          'Visible fabric hole or damage',
          'Large print peeling or wrong print'
        ]
      }
    ]
  },
  {
    id: 'unboxing',
    zhTitle: '开箱政策',
    enTitle: 'Unboxing Policy',
    warning: {
      zh: '⚠️ 所有退换货申请均需提供完整开箱视频，否则无法受理。',
      en: '⚠️ All return or exchange requests require a complete unboxing video, otherwise they cannot be accepted.'
    },
    items: [
      {
        titleZh: '建议全程录影',
        titleEn: 'Record before opening',
        textZh: '收到包裹后，强烈建议在 拆包前 开始录制，直到完整展示所有商品内容。此视频是申请退换货的重要凭证。',
        textEn: 'Please start recording before opening the parcel and continue until all items are clearly shown. This video is crucial for any claims.'
      },
      {
        titleZh: '如何录影',
        titleEn: 'How to record',
        listZh: [
          '将包裹放在光线充足的环境下',
          '确保视频清晰，包裹外箱完整出镜',
          '从包裹封口状态开始录制，中途不可暂停'
        ],
        listEn: [
          'Record in a bright place',
          'Show the sealed parcel clearly',
          'Do not pause or cut the video'
        ]
      },
      {
        titleZh: '如何拍摄',
        titleEn: 'What to show',
        listZh: [
          '拍摄商品正面、背面及吊牌',
          '如有色差，放在自然光下拍摄对比',
          '如有质量问题，特写拍摄问题部位'
        ],
        listEn: [
          'Front, back and tag of each item',
          'Natural-light comparison for colour issue',
          'Close-up of any suspected defect'
        ]
      },
      {
        titleZh: '什么时候联系客服',
        titleEn: 'When to contact us',
        textZh: '如发现商品有问题，请在收货后 24小时内 联系客服，并附上开箱视频及照片。',
        textEn: 'If there is an issue, contact us within 24 hours after receiving the parcel with video and photos.'
      },
      {
        titleZh: '影片保存多久',
        titleEn: 'How long to keep the video',
        textZh: '建议保存至少 14天，以备不时之需。',
        textEn: 'Please keep the video for at least 14 days.'
      },
      {
        titleZh: '审核流程',
        titleEn: 'Review process',
        listZh: [
          '提交视频及照片后，客服将在 1–2 个工作日内审核',
          '审核通过后，告知退换货方案',
          '审核不通过将说明原因'
        ],
        listEn: [
          'We review submitted proof within 1-2 working days and advise the next step.',
          'If approved, the exchange/return scheme is provided',
          'If not approved, we will explain the reason'
        ]
      }
    ]
  },
  {
    id: 'cancellation',
    zhTitle: '订单取消政策',
    enTitle: 'Cancellation Policy',
    items: [
      {
        titleZh: '未付款多久取消',
        titleEn: 'Unpaid orders',
        textZh: 'DuitNow/FPX 订单创建后 24小时内 未收到付款截图，订单将自动取消，库存恢复。',
        textEn: 'DuitNow or FPX orders without payment proof within 24 hours may be cancelled automatically and stock will be released.'
      },
      {
        titleZh: '已付款能否取消',
        titleEn: 'Paid orders',
        textZh: '付款确认后，如包装尚未开始，可联系客服申请取消并全额退款。',
        textEn: 'Paid orders may be cancelled only if packing has not started.'
      },
      {
        titleZh: '已包装能否取消',
        titleEn: 'Packed orders',
        textZh: '包装完成后原则上不接受取消，如有特殊情况请联系客服协商。',
        textEn: 'Once packing is completed, cancellation is generally not accepted.'
      },
      {
        titleZh: '已寄出不可取消',
        titleEn: 'Shipped orders',
        textZh: '商品一经发出不可取消，如需退货请按退换货流程处理。',
        textEn: 'Shipped orders cannot be cancelled.'
      },
      {
        titleZh: '预购取消规则',
        titleEn: 'Pre-orders',
        textZh: '预购商品在发货前均可取消并全额退款，发货后不可取消。',
        textEn: 'Pre-orders can be cancelled before shipment. After shipping, cancellation is not accepted.'
      }
    ]
  },
  {
    id: 'sizing',
    zhTitle: '尺寸政策',
    enTitle: 'Sizing Policy',
    items: [
      {
        titleZh: '如何量尺寸',
        titleEn: 'How to measure',
        textZh: '请参考我们的量身指南，测量胸围、腰围、臀围及身高，与商品尺寸表对照选择最合适的尺码。',
        textEn: 'Please measure bust, waist, hip and height, then compare with the product\'s actual measurements.'
      },
      {
        titleZh: '推荐参考',
        titleEn: 'What to follow',
        textZh: '建议优先参考尺寸表中的"实际尺寸"，而非标注的 S/M/L 尺码，因各款版型不同。',
        textEn: 'Prioritise the actual garment measurements instead of only S/M/L labels, as each cutting may be different.'
      },
      {
        titleZh: 'Model 资料',
        titleEn: 'Model details',
        textZh: '每款商品均注明模特身高、体重及所穿尺码，供参考。',
        textEn: 'Model height, weight and try-on size are shown where available for reference.'
      },
      {
        titleZh: '不接受换尺寸',
        titleEn: 'No size exchange',
        tag: { type: 'no', zh: '不接受', en: 'Not accepted' },
        textZh: '下单后不接受换尺寸申请。请在下单前仔细参考尺寸表及模特数据，如有疑问请先联系客服。',
        textEn: 'Size exchange is not accepted after ordering. Please contact us before checkout if you are unsure.'
      },
      {
        titleZh: '不接受换颜色',
        titleEn: 'No colour exchange',
        tag: { type: 'no', zh: '不接受', en: 'Not accepted' },
        textZh: '下单后原则上不接受换颜色。如确有需要，请在付款后 2小时内 通过 WhatsApp 联系客服，视情况而定。',
        textEn: 'Colour exchange is generally not accepted after ordering. Contact us within 2 hours after payment if there is an urgent request.'
      },
      {
        titleZh: '联系客服',
        titleEn: 'Need help?',
        textZh: '如对尺寸有任何疑问，欢迎在下单前 WhatsApp +601120861073（周一至周五）咨询，我们会根据您的身材给出建议。',
        textEn: 'WhatsApp us at +601120861073 before ordering. We can suggest sizing based on your body measurements.'
      }
    ]
  },
  {
    id: 'privacy',
    zhTitle: '隐私政策',
    enTitle: 'Privacy Policy',
    items: [
      {
        titleZh: '收集什么资料',
        titleEn: 'Information collected',
        listZh: [
          '姓名、联系电话、收件地址',
          '邮箱地址',
          '订单及支付记录',
          '网站浏览行为（匿名）'
        ],
        listEn: [
          'Name, phone number and shipping address',
          'Email address',
          'Order and payment records',
          'Anonymous browsing behaviour'
        ]
      },
      {
        titleZh: '如何使用',
        titleEn: 'How we use it',
        listZh: [
          '处理及配送您的订单',
          '发送订单确认及更新通知',
          '改善我们的服务'
        ],
        listEn: [
          'To process and deliver orders',
          'To send order confirmation and updates',
          'To improve our service'
        ]
      },
      {
        titleZh: '是否分享第三方',
        titleEn: 'Third parties',
        textZh: '我们不会将您的个人资料出售给任何第三方，仅会与配送服务商共享必要的配送信息。',
        textEn: 'We do not sell personal data. Necessary delivery details may be shared with courier partners.'
      },
      {
        titleZh: 'Email 用途',
        titleEn: 'Email use',
        textZh: '您的邮箱仅用于发送订单相关通知（确认、发货、退款等）。',
        textEn: 'Email is used for order confirmation, shipment updates, refund notices and support communication.'
      },
      {
        titleZh: 'Marketing 用途',
        titleEn: 'Marketing',
        textZh: '如您选择订阅，我们可能发送新品及促销信息。您可随时点击邮件底部"退订"取消。',
        textEn: 'If you subscribe, we may send new arrival or promotion emails. You may unsubscribe anytime.'
      }
    ]
  },
  {
    id: 'terms',
    zhTitle: '服务条款',
    enTitle: 'Terms & Conditions',
    items: [
      {
        titleZh: '使用网站规则',
        titleEn: 'Website use',
        textZh: '您同意以合法目的使用本网站，不得进行任何欺诈、骚扰或违法行为。',
        textEn: 'You agree to use this website for lawful purposes only and not for fraud, harassment or illegal activity.'
      },
      {
        titleZh: '下单代表同意政策',
        titleEn: 'Ordering means agreement',
        textZh: '提交订单即表示您已阅读并同意本店所有政策，包括退换货、配送及付款政策。',
        textEn: 'Submitting an order means you have read and agreed to our shipping, payment, return and store policies.'
      },
      {
        titleZh: '商品版权',
        titleEn: 'Product copyright',
        textZh: '所有商品设计版权归 Cippy Malaysia 所有，未经授权不得复制、仿制或销售。',
        textEn: 'Product designs and selections belong to Cippy Malaysia where applicable and may not be copied or resold without permission.'
      },
      {
        titleZh: '图片版权',
        titleEn: 'Image copyright',
        textZh: '网站所有图片版权归 Cippy Malaysia 所有，未经书面授权不得转载使用。',
        textEn: 'Website images belong to Cippy Malaysia and cannot be reused without written permission.'
      },
      {
        titleZh: '保留修改权利',
        titleEn: 'Policy updates',
        textZh: 'Cippy Malaysia 保留随时修改本政策的权利，修改后将在网站公告，继续使用即视为接受更新条款。',
        textEn: 'Cippy Malaysia may update these terms at any time. Continued website use means acceptance of the updated terms.'
      },
      {
        titleZh: '法律适用（马来西亚）',
        titleEn: 'Governing law',
        textZh: '本条款受马来西亚法律管辖，任何争议将在马来西亚法院解决。',
        textEn: 'These terms are governed by Malaysia law.'
      }
    ]
  },
  {
    id: 'payment',
    zhTitle: '付款政策',
    enTitle: 'Payment Policy',
    items: [
      {
        titleZh: '接受哪些付款方式',
        titleEn: 'Accepted payment methods',
        listZh: [
          'DuitNow QR（推荐）',
          'FPX 网络银行',
          '信用卡 / 借记卡（Visa、Mastercard）'
        ],
        listEn: [
          'DuitNow QR',
          'FPX online banking',
          'Credit or debit card, Visa and Mastercard'
        ]
      },
      {
        titleZh: '支付期限',
        titleEn: 'Payment deadline',
        textZh: 'DuitNow 及 FPX 订单请在 24小时内 完成付款，否则订单自动取消。',
        textEn: 'DuitNow and FPX orders must be paid within 24 hours, otherwise the order may be cancelled.'
      },
      {
        titleZh: '未付款订单',
        titleEn: 'Unpaid orders',
        textZh: '超过 24 小时未付款，订单将自动取消，已保留库存恢复正常销售。',
        textEn: 'Unpaid orders are automatically cancelled after the payment period and reserved stock will be released.'
      },
      {
        titleZh: '汇率说明',
        titleEn: 'Currency',
        textZh: '所有价格以马来西亚令吉（MYR）计算。',
        textEn: 'All prices are charged in Malaysian Ringgit, MYR.'
      },
      {
        titleZh: '付款失败',
        titleEn: 'Payment failure',
        textZh: '如付款失败，请检查账户余额或联系银行。可重新下单或联系客服协助。',
        textEn: 'If payment fails, please check your account or contact your bank. You may reorder or contact us for help.'
      }
    ]
  },
  {
    id: 'membership',
    zhTitle: '会员政策',
    enTitle: 'Membership Policy',
    items: [
      {
        titleZh: '积分规则',
        titleEn: 'Points',
        textZh: '每消费 RM 1 获得 1 积分，积分可用于抵扣消费（兑换比率另行公告）。',
        textEn: 'Earn 1 point for every RM 1 spent. Redemption rate may be announced separately.'
      },
      {
        titleZh: 'Luxe 会员',
        titleEn: 'Luxe member',
        textZh: '累计消费满 RM 800 升级，享 1.5倍积分、专属优先购买权。',
        textEn: 'Upgrade after RM 800 accumulated spend. Enjoy 1.5x points and priority access.'
      },
      {
        titleZh: 'Elite 会员',
        titleEn: 'Elite member',
        textZh: '累计消费满 RM 2,000 升级，享 2倍积分、免费运费、专属新品预览。',
        textEn: 'Upgrade after RM 2,000 accumulated spend. Enjoy 2x points, free shipping and exclusive previews.'
      },
      {
        titleZh: '积分有效期',
        titleEn: 'Points validity',
        textZh: '积分自获得之日起 12个月 内有效，逾期作废。',
        textEn: 'Points are valid for 12 months from the date earned.'
      },
      {
        titleZh: '升级规则',
        titleEn: 'Upgrade rule',
        textZh: '升级以累计消费金额计算，无时间限制。',
        textEn: 'Tier upgrades are based on accumulated spend.'
      },
      {
        titleZh: '降级规则',
        titleEn: 'Downgrade rule',
        textZh: '目前不设降级机制，累计消费等级永久保留。',
        textEn: 'Current membership tiers do not downgrade once achieved.'
      }
    ]
  },
  {
    id: 'promotions',
    zhTitle: '优惠券政策',
    enTitle: 'Promotion Policy',
    items: [
      {
        titleZh: '是否可叠加',
        titleEn: 'Stacking',
        textZh: '每笔订单只能使用 一张 优惠码，不可与其他折扣叠加使用。',
        textEn: 'Only one discount code can be used per order unless stated otherwise.'
      },
      {
        titleZh: '使用期限',
        titleEn: 'Expiry',
        textZh: '优惠码有使用期限，逾期自动失效，不可延期。',
        textEn: 'Discount codes have expiry dates and cannot be extended after expiry.'
      },
      {
        titleZh: '最低消费',
        titleEn: 'Minimum spend',
        textZh: '部分优惠码设有最低消费门槛，使用前请阅读优惠说明。',
        textEn: 'Some codes require a minimum spend. Please read the promotion details before using.'
      },
      {
        titleZh: '特价商品',
        titleEn: 'Sale items',
        textZh: 'Sale 特价商品不适用于任何优惠码折扣。',
        textEn: 'Sale items are not eligible for additional discount codes unless stated otherwise.'
      },
      {
        titleZh: '退款后优惠处理',
        titleEn: 'After refund',
        textZh: '订单退款后，已使用的优惠码不予恢复或退还。',
        textEn: 'Used codes will not be restored or returned after an order refund.'
      }
    ]
  },
  {
    id: 'aftersales',
    zhTitle: '售后服务',
    enTitle: 'After-sales Service',
    items: [
      {
        titleZh: '客服时间',
        titleEn: 'Service hours',
        textZh: '周一至周五 10:00am – 6:00pm（马来西亚时间）。公共假日可能延迟回复。',
        textEn: 'Monday to Friday, 10:00am-6:00pm Malaysia time. Replies may be slower on public holidays.'
      },
      {
        titleZh: '回复时间',
        titleEn: 'Reply time',
        textZh: 'WhatsApp 消息通常在 1–4 小时内回复。',
        textEn: 'WhatsApp messages are usually replied within 1-4 hours during service hours.'
      },
      {
        titleZh: '售后申请方式',
        titleEn: 'How to request support',
        textZh: '请通过 WhatsApp +601120861073 联系我们，附上订单号及问题描述/照片/视频。',
        textEn: 'WhatsApp +601120861073 with your order number, issue description, photos and video if needed.'
      },
      {
        titleZh: '审核流程',
        titleEn: 'Review process',
        textZh: '客服收到申请后 1–2 个工作日内完成初步审核，告知是否符合退换货条件。',
        textEn: 'We review after-sales requests within 1-2 working days and advise whether the case is eligible.'
      },
      {
        titleZh: '处理时间',
        titleEn: 'Processing time',
        textZh: '换货商品审核通过后 3–5 个工作日内寄出，退款处理时间为 5–10 个工作日。',
        textEn: 'Approved exchange items ship within 3-5 working days. Refunds take 5-10 working days to process.'
      },
      {
        titleZh: '客服联系方式',
        titleEn: 'Contact',
        listZh: [
          'WhatsApp：+601120861073（周一至周五）'
        ],
        listEn: [
          'WhatsApp: +601120861073, Monday to Friday'
        ]
      }
    ]
  },
  {
    id: 'care',
    zhTitle: '洗涤保养',
    enTitle: 'Care Guide',
    items: [
      {
        titleZh: '洗涤方式',
        titleEn: 'Washing',
        listZh: [
          '建议手洗或洗衣机柔洗模式，水温不超过 30°C',
          '深色衣物第一次洗涤前建议单独浸泡10分钟'
        ],
        listEn: [
          'Hand wash or use gentle machine cycle below 30°C',
          'Soak dark colours separately before first wash'
        ]
      },
      {
        titleZh: '熨烫方式',
        titleEn: 'Ironing',
        listZh: [
          '雪纺、蕾丝类：低温（110°C），垫布保护',
          '棉麻类：中温，反面熨烫效果更佳',
          '针织类：不建议熨烫，悬挂整理即可'
        ],
        listEn: [
          'Chiffon and lace: low heat with cloth protection',
          'Cotton and linen: medium heat, iron inside out',
          'Knitwear: steaming or hanging is preferred'
        ]
      },
      {
        titleZh: '深浅色分开',
        titleEn: 'Separate colours',
        textZh: '深色衣物请勿与浅色混洗，避免染色。新购深色衣物前几次建议单独清洗。',
        textEn: 'Wash dark and light colours separately to avoid colour transfer.'
      },
      {
        titleZh: '针织保养',
        titleEn: 'Knitwear care',
        textZh: '针织衣物建议平铺晾干，避免悬挂变形。洗涤时放入洗衣袋保护。',
        textEn: 'Lay flat to dry and avoid hanging heavy knitwear when wet.'
      },
      {
        titleZh: '蕾丝保养',
        titleEn: 'Lace care',
        textZh: '蕾丝衣物建议手洗，不可机洗，避免钩丝。洗后平铺阴干。',
        textEn: 'Hand wash lace items gently and avoid machine washing to prevent snagging.'
      },
      {
        titleZh: '晾晒方式',
        titleEn: 'Drying',
        textZh: '建议阴凉通风处晾干，避免阳光直射褪色。针织及雪纺建议平铺晾干。',
        textEn: 'Dry in a cool shaded place. Avoid direct sunlight for delicate fabrics.'
      }
    ]
  }
];

export interface FaqItem {
  qZh: string;
  qEn: string;
  aZh: string;
  aEn: string;
}

export const FAQS: FaqItem[] = [
  {
    qZh: '可以退货吗？',
    qEn: 'Can I return an item?',
    aZh: '可以，但需满足退换货条件，且需提供完整开箱视频。请查阅退换货政策了解详情。',
    aEn: 'Yes, if the request meets our return conditions and you can provide a complete unboxing video. Please check the Return & Exchange Policy for details.'
  },
  {
    qZh: '可以换尺寸吗？',
    qEn: 'Can I exchange for another size?',
    aZh: '不接受换尺寸，请在下单前仔细参考尺寸表，如有疑问请先联系客服。',
    aEn: 'Size exchanges are not accepted. Please check the size chart carefully before ordering, or contact us before checkout if you are unsure.'
  },
  {
    qZh: '可以换颜色吗？',
    qEn: 'Can I exchange for another colour?',
    aZh: '下单后原则上不接受换颜色。如确有需要，请在付款后2小时内通过WhatsApp联系客服，视情况而定。',
    aEn: 'Colour exchanges are generally not accepted after ordering. If needed, please contact us on WhatsApp within 2 hours after payment. Approval depends on packing status and stock.'
  },
  {
    qZh: '没有库存怎么办？',
    qEn: 'What if an item is out of stock?',
    aZh: '如下单后发现缺货，我们会联系您协商：等待补货或全额退款。',
    aEn: 'If an item becomes unavailable after your order, we will contact you to arrange restock waiting or a full refund.'
  },
  {
    qZh: '发货多久？',
    qEn: 'When will my order ship?',
    aZh: '现货商品付款后 1–3 个工作日内发货，预购商品以商品页面注明时间为准。',
    aEn: 'Ready-stock items ship within 1-3 working days after payment confirmation. Pre-order timing follows the product page.'
  },
  {
    qZh: '可以修改地址吗？',
    qEn: 'Can I change my address?',
    aZh: '付款后 2 小时内可联系客服修改，包装完成后无法修改。',
    aEn: 'You may contact us within 2 hours after payment to request an address change. Once packing is completed, the address cannot be changed.'
  },
  {
    qZh: '可以合并订单吗？',
    qEn: 'Can I combine orders?',
    aZh: '如两笔订单在同一天下单且尚未开始包装，可联系客服尝试合并，但不保证成功。',
    aEn: 'If both orders were placed on the same day and packing has not started, we can try to combine them. This is not guaranteed.'
  },
  {
    qZh: '有国际配送吗？',
    qEn: 'Do you offer international shipping?',
    aZh: '目前提供配送至新加坡。如有其他国际配送需求请联系客服咨询。',
    aEn: 'We currently ship to Singapore. For other countries, please contact us before ordering.'
  },
  {
    qZh: '怎么联系客服？',
    qEn: 'How do I contact support?',
    aZh: 'WhatsApp +601120861073（周一至周五 10am–6pm）。',
    aEn: 'WhatsApp +601120861073, Monday to Friday, 10am-6pm Malaysia time.'
  }
];
