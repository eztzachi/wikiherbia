package data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;

@Data
@Entity
public class Herb {

    private @Id
    @GeneratedValue
    Long id;
    private String englishName;
    private HerbCategory herbCategory;
    private String description;

    private @Version
    @JsonIgnore
    Long version;

    private Herb() {}

    public Herb(String englishName, HerbCategory herbCategory, String description) {
        this.englishName = englishName;
        this.herbCategory = herbCategory;
        this.description = description;
    }
}