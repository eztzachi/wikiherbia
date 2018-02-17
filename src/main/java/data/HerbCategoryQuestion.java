package data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.util.Collection;

@Data
@Entity
public class HerbCategoryQuestion implements Question{

    private @Id
    @GeneratedValue
    Long id;
    private String textTemplate = "What is the category of";
    @ElementCollection(targetClass = HerbCategory.class)
    private Collection<HerbCategory> options;
    @ManyToOne
    private Herb herb;
    @JsonIgnore
    int correctAnswer;

    private HerbCategoryQuestion() {}

    public HerbCategoryQuestion(Collection<HerbCategory> options, Herb herb, int correctAnswer) {
        this.options = options;
        this.herb = herb;
        this.correctAnswer = correctAnswer;
    }
}
