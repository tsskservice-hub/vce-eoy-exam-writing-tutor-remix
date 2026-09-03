const fs = require('fs');
const path = require('path');
const kuromoji = require('kuromoji');

const vceKanjiList = new Set([
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万',
  '本', '人', '回', '才', '円', '番',
  '春', '夏', '秋', '冬', '日', '月', '火', '水', '木', '金', '土', '曜', '年', '時', '分', '夕', '半', '午', '毎', '週', '間', '今', '先', '朝', '晩', '昼', '夜', '去',
  '目', '口', '耳', '手', '体',
  '上', '中', '下', '右', '左', '前', '後', '東', '西', '南', '北', '外',
  '学', '校', '英', '語', '文', '漢', '字', '勉', '強',
  '父', '母', '子', '家', '族', '兄', '弟', '姉', '妹', '友', '私', '男', '女',
  '大', '小', '好', '安', '高', '新', '古', '多', '少', '楽', '長', '近', '正', '広', '早', '明',
  '行', '来', '休', '出', '入', '生', '見', '思', '書', '言', '話', '読', '売', '買', '食', '飲', '知', '作', '住', '会', '使', '着', '発', '聞', '帰', '持', '待', '教', '乗', '働', '動', '歩', '終', '始', '泊', '洗', '立', '考', '習',
  '山', '川', '田', '花', '島', '海', '天', '雨', '雪', '牛', '魚', '馬', '犬',
  '京', '都', '市', '県', '州', '国', '町', '神', '寺', '駅', '店', '電', '車', '道', '旅',
  '赤', '青', '白', '黒', '色', '銀', '々',
  '何', '紙', '元', '気', '活', '社', '自', '物', '名', '方', '院', '所', '屋', '肉', '場', '飯', '洋', '和', '病', '次', '同', '仕', '事', '点'
]);

function katakanaToHiragana(str) {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, match => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

// 1つの文字列に対してルビを振る関数
function addFuriganaToText(text, tokenizer) {
  if (!text || typeof text !== 'string') return text;
  
  const tokens = tokenizer.tokenize(text);
  let newText = '';

  tokens.forEach(token => {
    const surface = token.surface_form; 
    const reading = katakanaToHiragana(token.reading); 

    // VCEリスト外の漢字が含まれているかチェック
    let hasNonVceKanji = false;
    for (let i = 0; i < surface.length; i++) {
      if (/[\u4e00-\u9faf]/.test(surface[i]) && !vceKanjiList.has(surface[i])) {
        hasNonVceKanji = true;
        break;
      }
    }

    if (hasNonVceKanji && reading && surface !== reading) {
      const matchOkuri = surface.match(/^(.+?)([\u3041-\u3096]+)$/);
      
      if (matchOkuri) {
        const kPart = matchOkuri[1]; 
        const oPart = matchOkuri[2]; 
        
        if (reading.endsWith(oPart)) {
          const kReading = reading.slice(0, reading.length - oPart.length);
          newText += `<ruby>${kPart}<rt>${kReading}</rt></ruby>${oPart}`;
        } else {
          newText += `<ruby>${surface}<rt>${reading}</rt></ruby>`;
        }
      } else {
        newText += `<ruby>${surface}<rt>${reading}</rt></ruby>`;
      }
    } else {
      newText += surface;
    }
  });

  return newText;
}

// プロジェクトルートからの相対パスで辞書とJSONを指定
kuromoji.builder({ dicPath: path.join(__dirname, '../node_modules/kuromoji/dict') }).build((err, tokenizer) => {
  if (err) {
    console.error('辞書のロードに失敗しました:', err);
    return;
  }

  // texttypes.json の配置場所
  const jsonPath = path.join(__dirname, '../app/data/texttypes.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`エラー: ${jsonPath} が見つかりませんでした。`);
    return;
  }

  const textTypes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // 各セクションのプロパティ（title, purpose, structureなど）を走査してルビを付与
  const updatedTextTypes = {};

  for (const [key, value] of Object.entries(textTypes)) {
    const updatedItem = { ...value };

    // title
    if (updatedItem.title) {
      const originalTitle = updatedItem.title_original || updatedItem.title;
      updatedItem.title_original = originalTitle;
      updatedItem.title = addFuriganaToText(originalTitle, tokenizer);
    }

    // purpose
    if (updatedItem.purpose) {
      const originalPurpose = updatedItem.purpose_original || updatedItem.purpose;
      updatedItem.purpose_original = originalPurpose;
      updatedItem.purpose = addFuriganaToText(originalPurpose, tokenizer);
    }

    // structure (配列の場合)
    if (Array.isArray(updatedItem.structure)) {
      if (!updatedItem.structure_original) {
        updatedItem.structure_original = [...updatedItem.structure];
      }
      updatedItem.structure = updatedItem.structure_original.map(item => 
        addFuriganaToText(item, tokenizer)
      );
    }

    updatedTextTypes[key] = updatedItem;
  }

  fs.writeFileSync(jsonPath, JSON.stringify(updatedTextTypes, null, 2), 'utf8');
  console.log('✨ texttypes.json の漢字部分へのルビ振り＆更新が完了しました！');
});