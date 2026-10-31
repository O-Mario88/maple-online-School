package httpx

import (
	"net/http"
	"net/url"
	"strconv"
)

// PageSize matches the Django API's PAGE_SIZE so clients see the same pages.
const PageSize = 20

const maxPage = 10_000

// Page is a requested page of a list.
type Page struct {
	Number int
	Limit  int32
	Offset int32
}

// ParsePage reads ?page= (1-based). Bad or missing values mean page 1.
func ParsePage(r *http.Request) Page {
	n, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || n < 1 {
		n = 1
	}
	if n > maxPage {
		n = maxPage
	}
	return Page{Number: n, Limit: PageSize, Offset: int32((n - 1) * PageSize)}
}

// pageBody is DRF's PageNumberPagination envelope.
type pageBody[T any] struct {
	Count    int64   `json:"count"`
	Next     *string `json:"next"`
	Previous *string `json:"previous"`
	Results  []T     `json:"results"`
}

// WritePage writes results in DRF's paginated shape, with next/previous links.
func WritePage[T any](w http.ResponseWriter, r *http.Request, p Page, count int64, results []T) {
	if results == nil {
		results = []T{}
	}
	body := pageBody[T]{Count: count, Results: results}
	if int64(p.Number*PageSize) < count {
		next := pageURL(r, p.Number+1)
		body.Next = &next
	}
	if p.Number > 1 {
		prev := pageURL(r, p.Number-1)
		body.Previous = &prev
	}
	WriteJSON(w, http.StatusOK, body)
}

func pageURL(r *http.Request, n int) string {
	u := url.URL{Path: r.URL.Path}
	q := r.URL.Query()
	q.Set("page", strconv.Itoa(n))
	u.RawQuery = q.Encode()
	return u.String()
}
