# DAIA Lab Website

이화여자대학교 DAIA (Data & AI Applications) 연구실 홈페이지입니다.

## 🚀 서버 실행

```bash
# 프로젝트 폴더에서 실행
python -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속

---

## 📁 폴더 구조

```
Lab/
├── index.html          # 메인 HTML 파일
├── src/                # JavaScript 소스 코드
│   ├── main.js         # 라우터 및 앱 초기화
│   ├── config.js       # 사이트 설정 (연구실 이름 등)
│   ├── components/     # 공통 컴포넌트
│   │   ├── Header.js   # 네비게이션 헤더
│   │   └── Footer.js   # 푸터
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── Home.js
│   │   ├── Research.js
│   │   ├── Projects.js
│   │   ├── Teaching.js
│   │   ├── Gallery.js
│   │   ├── Contact.js
│   │   ├── People/
│   │   │   ├── Members.js   # 교수 + 학생 통합 페이지
│   │   │   └── Alumni.js
│   │   └── Publications/
│   │       ├── International.js
│   │       ├── Domestic.js
│   │       └── Patent.js
│   └── utils/
│       └── dataLoader.js    # JSON 데이터 로더
├── data/               # 데이터 (JSON 파일)
│   ├── people/
│   │   ├── professor.json   # 교수 정보
│   │   ├── students.json    # 학생 정보
│   │   └── alumni.json      # 졸업생 정보
│   ├── publications/
│   │   ├── international.json
│   │   ├── domestic.json
│   │   └── patent.json
│   ├── projects.json        # 프로젝트 목록
│   ├── research.json        # 연구 분야
│   ├── teaching.json        # 강의 목록
│   └── gallery.json         # 갤러리 이미지
├── assets/             # 이미지 파일
│   ├── ewha/           # 이화여대 로고
│   ├── home/           # 홈 슬라이더 배경 이미지
│   ├── people/         # 구성원 프로필 사진
│   ├── projects/       # 프로젝트 이미지
│   ├── gallery/        # 갤러리 이미지
│   └── imoticon/       # 소셜 아이콘 (GitHub, LinkedIn 등)
└── styles/
    └── style.css       # 전체 스타일시트
```

---

## 📝 데이터 수정 가이드

### 1. 구성원 (People)

**교수 정보**: `data/people/professor.json`
```json
{
  "id": 1,
  "name": "이름",
  "role": "Principal Investigator",
  "bio": "소개 내용",
  "image": "./assets/people/사진.jpg",
  "social": {
    "email": "이메일",
    "github": "GitHub URL",
    "linkedin": "LinkedIn URL",
    "cv": "CV URL",
    "scholar": "Google Scholar URL"
  }
}
```

**학생 정보**: `data/people/students.json`
- `role`은 반드시 다음 중 하나: `"Ph.D. Student"`, `"Master Student"`, `"Undergraduate Student"`

**졸업생**: `data/people/alumni.json`

### 2. 논문 (Publications)

- 국제 논문: `data/publications/international.json`
- 국내 논문: `data/publications/domestic.json`
- 특허: `data/publications/patent.json`

### 3. 뉴스 (News)

`data/news.json`
```json
{
  "id": 1,
  "date": "2025-12",
  "content": "뉴스 내용"
}
```
- `date`: YYYY-MM 형식 (자동으로 최신순 정렬됨)

### 4. 프로젝트 (Projects)

`data/projects.json`
```json
{
  "id": 1,
  "title": "프로젝트 제목",
  "period": "2025 - Present",
  "sponsor": "지원 기관",
  "description": "설명",
  "status": "Active" 또는 "Completed",
  "image": "/assets/projects/이미지.png",
  "tags": ["태그1", "태그2"],
  "featured": true
}
```
- `featured`: `true`로 설정하면 홈페이지 Featured Projects에 표시 (최신순 정렬, 최대 3개)

### 5. 강의 (Teaching)

`data/teaching.json`

### 6. 갤러리 (Gallery)

`data/gallery.json`
```json
{
  "id": 1,
  "title": "제목",
  "image": "./assets/gallery/이미지.png",
  "year": "2025",
  "semester": "Spring" 또는 "Fall"
}
```

---

## 🖼️ 이미지 추가

1. 적절한 폴더에 이미지 파일 추가
   - 구성원 사진: `./assets/people/`
   - 프로젝트 이미지: `./assets/projects/`
   - 갤러리 이미지: `./assets/gallery/`
   - 홈 배경: `./assets/home/`

2. JSON 파일에서 경로 업데이트

---

## ⚙️ 사이트 설정

`src/config.js`에서 연구실 이름 등 기본 설정 변경 가능

---

## 🔗 네비게이션 수정

`src/components/Header.js`에서 메뉴 구조 변경
`src/main.js`에서 라우트 추가/수정

---

## 📌 주의사항

- JSON 파일 수정 시 문법 오류 주의 (쉼표, 따옴표 등)
- 이미지 경로는 `./assets/...` 형식 사용 권장
- 새 페이지 추가 시 `src/main.js`의 routes에 등록 필요
