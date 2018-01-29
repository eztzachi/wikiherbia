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
    private String description;

    private @Version
    @JsonIgnore
    Long version;

    private Herb() {}

    public Herb(String englishName, String description) {
        this.englishName = englishName;
        this.description = description;
    }
}