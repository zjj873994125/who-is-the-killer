import chapterSixRaw from '../../docs/原文/第六章 尸体痉挛.md?raw';
import chapterSevenRaw from '../../docs/原文/第七章 悬空女尸.md?raw';

const chapterSevenMechanismEnd = '梁教授说：这个问题目前还无法解答，凶手的作案时间还是一个谜。';

function splitMarkdownParagraphs(raw: string) {
  return raw
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function sliceThrough(text: string, endText: string) {
  const endIndex = text.indexOf(endText);

  if (endIndex < 0) {
    return text;
  }

  return text.slice(0, endIndex + endText.length);
}

export const officialChapterOneOriginalStory = [
  {
    id: 'chapter-six-original',
    title: '第六章 尸体痉挛',
    paragraphs: splitMarkdownParagraphs(chapterSixRaw),
  },
  {
    id: 'chapter-seven-mechanism',
    title: '第七章 悬空女尸（死亡机制段）',
    paragraphs: splitMarkdownParagraphs(
      sliceThrough(chapterSevenRaw, chapterSevenMechanismEnd),
    ),
  },
] as const;

export const officialChapterOneReasoningStory = [
  '这一段原文把第一章的答案分成两层：第六章解决“现场为什么这么诡异”，第七章开头解决“死亡原因为什么能够成立”。尸体痉挛解释的是站立姿态，不能解释颈部撕裂和作案工具消失。',
  '关键推理在于把电梯从案发地点改看成杀人工具。钢丝或细线套住颈部后，电梯下降会提供远超人力的拉扯力量，工具完成作用后又可能缩回通气孔或井道，所以轿厢里看不到常规凶器。',
  '孩子看到的“悬空女人”不是鬼，而是受害人在死亡前被细线吊起、双腿挣扎后产生的目击错觉。电梯重新到达40楼时，头颅因颠簸滚出，身体则因尸体痉挛仍然站立。',
  '本章最后仍留下一个未解问题：凶手如何在42楼到41楼的极短时间里控制温小婉、反绑双手并套住脖子。这个问题不应该在第一章全部揭开，它会成为下一章继续调查“悬空女尸”的入口。',
] as const;
