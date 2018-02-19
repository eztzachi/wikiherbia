package data;

import lombok.Data;

import javax.persistence.*;
import java.util.Map;

@Data
@Entity
public class QuizSubmission {

    private @Id
    @GeneratedValue
    Long id;

    @ManyToOne
    private Quiz quiz;
    private double grade;
    @ElementCollection
    // questionID -> correct/incorrect
    private Map<Long, Boolean> checklist;

    private QuizSubmission() {}

    public QuizSubmission(Quiz quiz, double grade, Map<Long, Boolean> checklist) {
        this.quiz = quiz;
        this.grade = grade;
        this.checklist = checklist;
    }

    public double getGrade() {
        return grade;
    }
}
