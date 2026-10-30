package curriculum

import "testing"

func TestBuildTreeMatchesTheDjangoCatalogShape(t *testing.T) {
	rows := []TreeRow{
		{LevelID: 1, LevelName: "O-Level", ClassID: 10, ClassName: "S 1", TopicID: 101, TopicName: "Sets", SubjectID: 7, SubjectName: "Mathematics"},
		{LevelID: 1, LevelName: "O-Level", ClassID: 10, ClassName: "S 1", TopicID: 102, TopicName: "Numbers", SubjectID: 7, SubjectName: "Mathematics"},
		{LevelID: 1, LevelName: "O-Level", ClassID: 10, ClassName: "S 1", TopicID: 103, TopicName: "Angles", SubjectID: 7, SubjectName: "Mathematics"},
		{LevelID: 1, LevelName: "O-Level", ClassID: 10, ClassName: "S 1", TopicID: 104, TopicName: "Cells", SubjectID: 8, SubjectName: "Biology"},
		{LevelID: 1, LevelName: "O-Level", ClassID: 11, ClassName: "S 2"}, // a class with no topics yet
	}
	tree := BuildTree(rows)

	if len(tree.Levels) != 1 || len(tree.Levels[0].Classes) != 2 {
		t.Fatalf("want 1 level with 2 classes, got %+v", tree.Levels)
	}
	s1 := tree.Levels[0].Classes[0]
	if s1.ID != "s-1" || s1.Level != "O-Level" || len(s1.Terms) != 3 {
		t.Fatalf("class: %+v", s1)
	}
	// 3 maths topics split one per term; biology's single topic lands in term 1.
	if got := len(s1.Terms[0].Subjects); got != 2 {
		t.Fatalf("term 1 should hold maths and biology, got %d", got)
	}
	for i, want := range []string{"Sets", "Numbers", "Angles"} {
		maths := s1.Terms[i].Subjects[0]
		if maths.Name != "Mathematics" || maths.Topics[0].Name != want {
			t.Errorf("term %d maths: %+v", i+1, maths)
		}
	}
	topic := s1.Terms[0].Subjects[0].Topics[0]
	if len(topic.Subtopics) != 4 || len(topic.Subtopics[0].Lessons) != 3 || topic.Subtopics[0].Name != "Introduction & Overview" {
		t.Fatalf("each topic should have the 4 standard phases with 3 lessons: %+v", topic.Subtopics)
	}
	lessons := topic.Subtopics[0].Lessons
	if topic.Subtopics[0].ID != "dynamic-sub-101-0" || lessons[0].Type != "video" || lessons[1].Type != "notes" || lessons[2].Type != "exercise" {
		t.Errorf("ids and lesson types should match Django's: %+v", topic.Subtopics[0])
	}
	if s2 := tree.Levels[0].Classes[1]; len(s2.Terms) != 3 || len(s2.Terms[0].Subjects) != 0 {
		t.Errorf("an empty class still has 3 empty terms: %+v", s2)
	}
}
