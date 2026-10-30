// Package reports serves subject marks and term report cards.
package reports

import "math"

// Result is a total out of 100 with its grade and descriptor.
type Result struct {
	Total      float64
	Grade      string
	Descriptor string
}

// band is a grade for totals at or above Min.
type band struct {
	Min        float64
	Grade      string
	Descriptor string
}

// ncdc is Uganda's NCDC lower-secondary scale: formative (out of 20) plus
// summative (out of 80) gives a total out of 100. Other countries' scales
// will sit beside this one as the curriculum module moves to Go.
var ncdc = []band{
	{90, "A*", "Outstanding"},
	{80, "A", "Excellent"},
	{70, "B", "Very Good"},
	{60, "C", "Good"},
	{50, "D", "Moderate"},
	{40, "E", "Basic"},
	{30, "F", "Below Average"},
	{0, "G", "Ungraded"},
}

// Band rounds total to one decimal, as Django did, and grades it.
func Band(total float64) Result {
	rounded := math.Round(total*10) / 10
	for _, b := range ncdc {
		if rounded >= b.Min {
			return Result{Total: rounded, Grade: b.Grade, Descriptor: b.Descriptor}
		}
	}
	last := ncdc[len(ncdc)-1]
	return Result{Total: rounded, Grade: last.Grade, Descriptor: last.Descriptor}
}
