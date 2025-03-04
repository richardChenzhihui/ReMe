function formatDate(date: Date, language: string = "zh-CN") {
  let dayName;
  if (language === "en-US") {
    const englishDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    dayName = englishDays[date.getDay()];
  } else {
    const chineseDays = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    dayName = chineseDays[date.getDay()];
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  if (language === "en-US") {
    return `${dayName}, ${month}/${day}/${year}`;
  } else {
    return `${dayName}，${month}/${day}/${year}`;
  }
}

function getDay(date: Date) {
  return date.getDate().toString().padStart(2, "0");
}

function getMonth(date: Date, language: string = "zh-CN") {
  if (language === "en-US") {
    const englishMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return englishMonths[date.getMonth()];
  } else {
    const chineseMonths = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ];
    return chineseMonths[date.getMonth()];
  }
}

export { formatDate, getDay, getMonth };
