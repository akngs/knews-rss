# knews-rss

한국 언론사 RSS 모음 및 파서입니다. PR 환영 :)

# 데이터

- [data/publishers.csv](data/publishers.csv): 정리된 언론사 목록
- [data/feed_specs.csv](data/feed_specs.csv): 언론사별 RSS 명세 목록

# 수집된 RSS 예시

전체:

- https://akngs.github.io/knews-rss/all.xml

분야별:

- https://akngs.github.io/knews-rss/categories/column.xml
- https://akngs.github.io/knews-rss/categories/women.xml
- https://akngs.github.io/knews-rss/categories/tech.xml

언론사별:

- https://akngs.github.io/knews-rss/publishers/hani.xml
- https://akngs.github.io/knews-rss/publishers/khan.xml
- https://akngs.github.io/knews-rss/publishers/mediatoday.xml

# 기여하기

- 아래 참고자료 목록을 참고하여 `publishers.csv`와 `feed_specs.csv`에 빠진 데이터를 추가한 뒤 PR을 보내주세요.
- 데이터를 추가할 때 언론사 이름 기준 가나다순 정렬이 유지되도록 해주세요.
- `feed_specs.csv`의 `categories`에는 다음 값들을 `|`로 구분하여 적어주세요. 분류에 부합되지 않는 RSS는 당분간
  제외하고자 합니다:
  - `_all_`: 전체 기사
  - `it`, `health`, `economy`, `science`, `international`, `cartoon`, `culture`,
    `opinion`, `society`, `sports`, `women`, `entertainment`, `people`, `tech`,
    `medical`, `politics`

# 참고자료

- 한국어 위키백과
  [한국어 신문 목록](https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%8B%A0%EB%AC%B8_%EB%AA%A9%EB%A1%9D)
- 한국어 위키백과
  [대한민국의 텔레비전 방송사 목록](https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD%EC%9D%98_%ED%85%94%EB%A0%88%EB%B9%84%EC%A0%84_%EB%B0%A9%EC%86%A1%EC%82%AC_%EB%AA%A9%EB%A1%9D)
- 미디어오늘의 [언론링크](http://www.mediatoday.co.kr/com/partners.html)
