package data;

import lombok.Data;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Collection;

@Data
@Entity
public class Quiz {

    private @Id
    @GeneratedValue
    Long id;
    @ElementCollection(targetClass = HerbCategoryQuestion.class)
    private Collection<HerbCategoryQuestion> questions = new ArrayList<>();

    public void create(HerbCategoryQuestionRepository repository) {
        repository.findAll().forEach(question -> questions.add(question));
    }

}
