// utils/quizData.js
// 中医体质分类与判定量表 — 数据字典
// 标准：GB/T 46939-2025

const quizData = {
  "standard": "GB/T 46939-2025",
  "name": "中医体质分类与判定量表（双版本）",
  "version": {
    "basic": {
      "name": "基础版（快速筛查）",
      "total_questions": 30,
      "estimated_minutes": "2~3分钟"
    },
    "full": {
      "name": "完整版（专业判定）",
      "total_questions": 60,
      "estimated_minutes": "5~7分钟"
    }
  },
  "score_options": {
    "1": "没有（根本不）",
    "2": "很少（有一点）",
    "3": "有时（有些）",
    "4": "经常（相当）",
    "5": "总是（非常）"
  },
  "constitutions": [
    {
      "id": "pinghe",
      "name": "平和质",
      "type": "normal",
      "basic_items": [
        { "id": 1, "text": "您精力充沛吗？", "reverse": false },
        { "id": 2, "text": "您容易疲乏吗？", "reverse": true },
        { "id": 3, "text": "您感到闷闷不乐、情绪低沉吗？", "reverse": true },
        { "id": 4, "text": "您比一般人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？", "reverse": true }
      ],
      "extra_items": [
        { "id": 101, "text": "您睡眠质量良好吗？", "reverse": false },
        { "id": 102, "text": "您食欲正常、消化良好吗？", "reverse": false },
        { "id": 103, "text": "您平时容易心烦急躁吗？", "reverse": true }
      ]
    },
    {
      "id": "qixu",
      "name": "气虚质",
      "type": "biased",
      "basic_items": [
        { "id": 5, "text": "您容易疲乏吗？", "reverse": false },
        { "id": 6, "text": "您容易气短（呼吸短促，接不上气）吗？", "reverse": false },
        { "id": 7, "text": "您容易心慌吗？", "reverse": false }
      ],
      "extra_items": [
        { "id": 104, "text": "您容易感冒吗？", "reverse": false },
        { "id": 105, "text": "您说话声音低弱、没力气吗？", "reverse": false },
        { "id": 106, "text": "您活动后容易出虚汗吗？", "reverse": false },
        { "id": 107, "text": "您内脏容易下垂（如胃下垂、脱肛等）吗？", "reverse": false },
        { "id": 108, "text": "您病后身体恢复慢吗？", "reverse": false }
      ]
    },
    {
      "id": "yangxu",
      "name": "阳虚质",
      "type": "biased",
      "basic_items": [
        { "id": 8, "text": "您胃脘部、背部或腰膝部怕冷吗？", "reverse": false },
        { "id": 9, "text": "您感到怕冷、衣服比别人穿得多吗？", "reverse": false },
        { "id": 10, "text": "您比一般人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？", "reverse": false }
      ],
      "extra_items": [
        { "id": 109, "text": "您手脚发凉吗？", "reverse": false },
        { "id": 110, "text": "您吃生冷食物容易腹泻或不舒服吗？", "reverse": false },
        { "id": 111, "text": "您大便稀溏、容易拉肚子吗？", "reverse": false },
        { "id": 112, "text": "您夜尿多或小便清长吗？", "reverse": false }
      ]
    },
    {
      "id": "yinxu",
      "name": "阴虚质",
      "type": "biased",
      "basic_items": [
        { "id": 11, "text": "您感觉身体、脸上发热吗？", "reverse": false },
        { "id": 12, "text": "您皮肤或口唇干吗？", "reverse": false },
        { "id": 13, "text": "您面部两颧潮红或偏红吗？", "reverse": false }
      ],
      "extra_items": [
        { "id": 113, "text": "您手足心发热吗？", "reverse": false },
        { "id": 114, "text": "您口燥咽干、喜欢喝冷饮吗？", "reverse": false },
        { "id": 115, "text": "您大便干燥、便秘吗？", "reverse": false },
        { "id": 116, "text": "您眼睛干涩吗？", "reverse": false },
        { "id": 117, "text": "您夜间睡觉容易出汗（盗汗）吗？", "reverse": false }
      ]
    },
    {
      "id": "tanshi",
      "name": "痰湿质",
      "type": "biased",
      "basic_items": [
        { "id": 14, "text": "您感到身体沉重不轻松或不爽快吗？", "reverse": false },
        { "id": 15, "text": "您腹部肥满松软吗？", "reverse": false },
        { "id": 16, "text": "您嘴里有黏黏的感觉吗？", "reverse": false }
      ],
      "extra_items": [
        { "id": 118, "text": "您面部皮肤油脂较多吗？", "reverse": false },
        { "id": 119, "text": "您胸闷、痰多吗？", "reverse": false },
        { "id": 120, "text": "您容易浮肿、身体发胀吗？", "reverse": false },
        { "id": 121, "text": "您喜欢吃肥甘甜黏的食物吗？", "reverse": false },
        { "id": 122, "text": "您上眼睑容易肿起吗？", "reverse": false }
      ]
    },
    {
      "id": "shire",
      "name": "湿热质",
      "type": "biased",
      "basic_items": [
        { "id": 17, "text": "您面部或鼻部有油腻感或者油亮发光吗？", "reverse": false, "gender": "all" },
        { "id": 18, "text": "您小便时尿道有发热感、尿色浓（深）吗？", "reverse": false, "gender": "all" },
        { "id": 19, "text": "您带下色黄（白带颜色发黄）吗？", "reverse": false, "gender": "female" },
        { "id": 20, "text": "您的阴囊部位潮湿吗？", "reverse": false, "gender": "male" }
      ],
      "extra_items": [
        { "id": 123, "text": "您容易生痤疮或疖肿吗？", "reverse": false, "gender": "all" },
        { "id": 124, "text": "您口苦、口中有异味吗？", "reverse": false, "gender": "all" },
        { "id": 125, "text": "您大便黏滞不畅、粘马桶吗？", "reverse": false, "gender": "all" },
        { "id": 126, "text": "您身重困倦、容易觉得累吗？", "reverse": false, "gender": "all" }
      ]
    },
    {
      "id": "xueyu",
      "name": "血瘀质",
      "type": "biased",
      "basic_items": [
        { "id": 21, "text": "您身体上有哪里疼痛吗？", "reverse": false },
        { "id": 22, "text": "您面色晦暗或容易出现褐斑吗？", "reverse": false },
        { "id": 23, "text": "您口唇颜色偏暗吗？", "reverse": false }
      ],
      "extra_items": [
        { "id": 127, "text": "您皮肤容易无故出现瘀青吗？", "reverse": false },
        { "id": 128, "text": "您舌下静脉粗大、颜色紫暗吗？", "reverse": false },
        { "id": 129, "text": "您女性痛经、经血有血块吗？（限女性）", "reverse": false, "gender": "female" },
        { "id": 130, "text": "您容易忘事（健忘）吗？", "reverse": false }
      ]
    },
    {
      "id": "qiyu",
      "name": "气郁质",
      "type": "biased",
      "basic_items": [
        { "id": 24, "text": "您感到闷闷不乐、情绪低沉吗？", "reverse": false },
        { "id": 25, "text": "您容易精神紧张、焦虑不安吗？", "reverse": false },
        { "id": 26, "text": "您多愁善感、感情脆弱吗？", "reverse": false }
      ],
      "extra_items": [
        { "id": 131, "text": "您经常无缘无故叹气吗？", "reverse": false },
        { "id": 132, "text": "您胁肋部容易胀痛吗？", "reverse": false },
        { "id": 133, "text": "您咽部有异物感、吐之不出咽之不下吗？", "reverse": false },
        { "id": 134, "text": "您睡眠差、容易失眠吗？", "reverse": false }
      ]
    },
    {
      "id": "tebing",
      "name": "特禀质",
      "type": "biased",
      "basic_items": [
        { "id": 27, "text": "您没有感冒时也会打喷嚏吗？", "reverse": false },
        { "id": 28, "text": "您容易过敏（对药物、食物、气味、花粉或在季节交替、气候变化时）吗？", "reverse": false },
        { "id": 29, "text": "您的皮肤容易起荨麻疹（风团、风疹块、风疙瘩）吗？", "reverse": false },
        { "id": 30, "text": "您的皮肤一抓就红，并出现抓痕吗？", "reverse": false }
      ],
      "extra_items": [
        { "id": 135, "text": "您没感冒也会鼻塞、流清鼻涕吗？", "reverse": false },
        { "id": 136, "text": "您有哮喘或过敏性鼻炎病史吗？", "reverse": false }
      ]
    }
  ],
  "judgment_rules": {
    "formula": "转化分 = [(原始分 - 条目数) / (条目数 × 4)] × 100",
    "pinghe": {
      "是": "转化分 ≥ 60 且 其他8种体质转化分均 < 30",
      "基本是": "转化分 ≥ 60 且 其他8种体质转化分均 < 40",
      "否": "不满足上述条件"
    },
    "biased": {
      "是": "转化分 ≥ 40",
      "倾向是": "转化分 30 ~ 39",
      "否": "转化分 < 30"
    }
  }
};

module.exports = quizData;
